import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { TextField, Button } from '@material-ui/core/';
import { CourseList } from './CourseList';
import { api } from '../../utils';
import { AddCourseForm } from './AddCourseForm';
import { UserSearchForm } from './UserSearchForm';
import { Session } from '../../App';

const useStyles = makeStyles(theme => ({
  dashboardButton: {
    margin: '0 auto',
    width: '100%',
    height: '65px',
    display: 'flex',
  },
  courseBoxWrapper: {
    height: '100%',
  },
}));

const getEnrolledCourses = username =>
  new Promise((resolve, reject) => {
    api
      .get('/' + username + '/courses')
      .then(resp => {
        console.log(resp);
        resolve(resp.data);
      })
      .catch(err => {
        console.log(err);
        reject([]);
      });
  });

function CourseBox() {
  const classes = useStyles();
  const [courseList, setCourseList] = React.useState([]);
  const [courseInFocus, setCourseInFocus] = React.useState('Dashboard');
  const session = React.useContext(Session);
  const username = session.user.id;

  React.useEffect(() => {
    getEnrolledCourses(username).then(ret => {
      setCourseList([...ret]);
    });
  }, []);

  const addCourse = course => {
    api
      .post('/' + course + '/enrol', {
        username,
      })
      .then(response => {
        const oldCourseList = [...courseList, { code: course }];
        const newCourseList = [];
        Object.keys(oldCourseList)
          .sort()
          .forEach(key => {
            console.log(oldCourseList[key]);
            newCourseList[key] = oldCourseList[key];
          });
        console.log(newCourseList);
        setCourseList([...newCourseList]);
      })
      .catch(err => {
        console.log(err);
      });
  };

  /* <Paper className={classes.centre}>
          <h1>This is: {courseInFocus}</h1>
          <h3>Find a user:</h3>
          <UserSearchForm courseInFocus={courseInFocus} />
        </Paper> */
  return (
    <Paper className={classes.courseBoxWrapper}>
      <Button
        className={classes.dashboardButton}
        variant="contained"
        onClick={() => {
          setCourseInFocus('Dashboard');
        }}
        color={'Dashboard' === courseInFocus ? 'primary' : 'secondary'}
      >
        DASHBOARD
      </Button>
      <div className={classes.courseList}>
        <CourseList
          courseList={courseList}
          courseInFocus={courseInFocus}
          setCourseInFocus={setCourseInFocus}
        />
      </div>
      <AddCourseForm className={classes.addCourseForm} addCourse={addCourse} />
    </Paper>
  );
}

export { CourseBox };
