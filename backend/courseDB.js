const userdb = require("./usersDB");
const getdb = require("./db").getDb;
const crypto = require('crypto');

let db = getdb();

module.exports = {
  // adds a course to the courselist
  addCourse: function(code, name) {
    return new Promise((resolve, reject) => {
      let sql = `INSERT INTO courses (code, name) VALUES (?, ?)`;
      db.run(sql, [code, name], function(err) {
        if (err) {
          reject(err.message);
        }

        if (this.changes) {
          this.addCourseInstance(code, new Date().getFullYear() + "T1");
          this.addCourseInstance(code, new Date().getFullYear() + "T2");
          this.addCourseInstance(code, new Date().getFullYear() + "T3");
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  },

  // returns list of courses according to prefix. If none is supplied, returns the entire list.
  getCourses: function(prefix) {
    return new Promise((resolve, reject) => {
      if (prefix) {
        let sql = "select code, name from courses where code like $drivername";
        const params = { $drivername: prefix + "%" };
        db.all(sql, params, (err, rows) => {
          if (err) {
            reject(err.message);
          } else {
            resolve(rows);
          }
        });
      } else {
        db.all(`SELECT code, name FROM courses`, (err, rows) => {
          if (err) {
            reject(err.message);
          } else {
            resolve(rows);
          }
        });
      }
    });
  },

  addCourseInstance: function(code, term) {
    let courseInstance = [code, term];
    return new Promise((resolve, reject) => {
      let sql = `INSERT OR IGNORE INTO courseInstance (code, term) VALUES (?, ?)`;
      db.run(sql, courseInstance, function(err) {
        if (err) {
          reject(err.message);
        }
        this.changes ? resolve(true) : resolve(false);
      });
    });
  },

  // possibly through a list, with zids most likely.
  addUsersFromList: function (course, userArray, username){
    return new Promise((resolve, reject) => {
      db.get(`SELECT rank FROM users where username = ?`, username, (err, row) => {
        if(row.rank != 1){
          reject({code: 403, msg: "Not authorized to submit userlist."});
        } else {
          // batch entry
          db.serialize(() => {
            db.run("begin transaction");
            const userEntry = db.prepare(
              `INSERT INTO users (username, password, email, zid, rank) VALUES (?,?,?,?,?)`,
              err => {
                if (err) {
                  console.log(err);
                }
              }
            );
            var id;
            userArray.forEach(entry => {
              id = crypto.randomBytes(6).toString('hex');
              id_email = id+"@unsw.edu.au";
              userEntry.run(id, id, id_email, entry, 3);
            })
            db.run("commit");
            userEntry.finalize();
            resolve({code: 200, msg: "OK"});
          })
        }
      })
    })
  },

  // enrolls a single existing user to the CURRENT INSTANCE of a course
  // SHOULD WE IMPLEMENT A LIMIT to how many courses a user can sign up for per semester? Yes
  addUsertoCourseInstance: function(user, code) {
    return new Promise((resolve, reject) => {
      userdb
        .userExists(user)
        .then(user => {
          if (!user) {
            resolve({ code: 404, msg: "User not found" });
          } else {
            let sql = `SELECT COUNT(username) as COUNT from userCourses where username = ?`;
            db.get(sql, user.data.username, (err, row) => {
              if (err) {
                console.log(err.message);
                reject(err.message);
              }

              if (row.COUNT < 4) {
                db.run(
                  `INSERT INTO userCourses (username, courseInstance) VALUES
                (?, (select id from courseInstance where term = (SELECT term from term WHERE active) AND code = ?))`,
                  [user.data.username, code],
                  err => {
                    if (err) {
                      reject({ code: 500, msg: err.message });
                    } else {
                      resolve({ code: 200, msg: "OK" });
                    }
                  }
                );
              } else {
                reject({
                  code: 400,
                  msg: "Cannot enrol user in more than 4 courses!"
                });
              }
            });
          }
        })
        .catch(err => {
          if (err) {
            reject("Error during userExists!");
          }
        });
    });
  },

  // returns all the usernames enrolled in a courseInstance
  courseUsers: function(code) {
    return new Promise((resolve, reject) => {
      // I want all the USERS enrolled in the current course instance
      db.all(
        `SELECT username from userCourses
      LEFT JOIN courseInstance ON 
      userCourses.courseInstance = courseInstance.id
      where code = ? AND term = (SELECT term from term WHERE active);`,
        code,
        (err, rows) => {
          if (err) {
            reject({ code: 500, msg: err.message });
          } else {
            resolve({ code: 200, data: rows });
          }
        }
      );
    });
  },

  addCourseDeadline: function(code, assignment) {
    return new Promise((resolve, reject) => {
      const { user, title, desc, dateFrom, dateTo } = assignment;

      db.get(`SELECT rank from USERS WHERE username = ?`, user, (err, row) => {
        if(err || !row){
          reject({code: (!row) ? 404 : 500, msg: err.message});
        }

        if(row.rank == 1){
          
          let sql = `INSERT INTO courseInstanceDeadlines (cInstanceid, title, desc, startdate, deadline)
          VALUES ( 
            (SELECT id FROM courseInstance WHERE code = ? AND term = (SELECT term FROM term WHERE active)),
              ?, ?, ?, ?)`;
          db.run(sql, [code, title, desc, dateFrom, dateTo], function(err) {
            if (err) {
              reject({ code: 500, msg: err.message });
            } else {
              this.changes
                ? resolve({ code: 200, msg: "OK" })
                : resolve({
                    code: 400,
                    msg: "Failed to Insert, check your values again"
                  });
            }
          });    
        } else {
          reject({code: 403, msg: "Not authorized, rank too low"});
        }
      })
    });
  },

  deleteCourseDeadlines: function(code) {
    return new Promise((resolve, reject) => {
      let sql = `delete from courseInstanceDeadlines as c where c.cInstanceid in (select id from courseInstance as c2 where c2.code = ?)` 
      db.run(sql, code, (err) => { 
        if (err) {

          reject({ code: 500, msg: err.message });
        } else {
          resolve({code: 200, msg: 'Huzzah!'})
        }
      });
    });
  },

  getCourseDeadlines: function(code) {
    return new Promise((resolve, reject) => {
      //if passed an array of course codes instead of a single course code...
      let placeholders = "?";

      if (require('util').isArray(code)) {
        placeholders = code.map(code => "(?)").join(",");
      }

      /*
      PLACEHOLDERS ONLY WORKS FOR INSERT
      */
      let sql =
        `SELECT title, desc, startdate, deadline FROM courseInstanceDeadlines
                LEFT JOIN courseInstance ON courseInstanceDeadlines.cInstanceid = courseInstance.id
                WHERE term = (SELECT term from term where active)
                AND code = ` + placeholders;
      db.all(sql, code, (err, rows) => {
        if (err) {
          reject({ code: 500, msg: err.message });
        } else {
          let empty = !!rows.length
          resolve({
            success: true,
            code: 200,
            data: rows,
            msg: empty ? "OK" : "Cannot find any deadlines"
          });
        }
      });
    });
  },

  addAnnouncement: function(course, user, content){
    return new Promise((resolve, reject) => {
      db.get(`SELECT rank FROM users WHERE username = ?`, user, (err, row) => {
        if(err || !row){
          reject({code: (!row) ? 404 : 500, msg: err.message});
        }

        if(row.rank == 1){    
          let sql = `INSERT INTO courseAnnouncements ( courseInstance, announcement, userid, datetime) VALUES ((
            SELECT id FROM courseInstance where code = ? AND term = (SELECT term from term WHERE active)
          ),?,?,?)`;
          db.run(sql, [course, content, user, new Date().toString()], function(err){
            if(err){
              reject({ code: 500, msg: err.message });
            }
            (this.lastID)
            ? resolve({code: 200, msg: "OK"})
            : resolve({code: 400, msg: "Please recheck input"});
          })
        } else {
          reject({code: 403, msg: "Not authorized, rank too low"});
        }
      })
    })
  },

  getAnnouncements: function(course){
    return new Promise((resolve, reject) => {
      let sql = `SELECT courseAnnouncements.* FROM courseAnnouncements 
            LEFT JOIN courseInstance ON courseAnnouncements.courseInstance = courseInstance.id
            WHERE code = ? AND term = (SELECT term FROM term WHERE active)`;
      db.all(sql, course, (err, rows) => {
        if(err){
          reject({ code: 500, msg: err.message });
        }
        resolve({code: 200, data: rows});
      
      })
    })
  }
};
