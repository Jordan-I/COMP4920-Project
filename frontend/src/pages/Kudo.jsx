import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Switch, Route } from 'react-router-dom';
import { Chat } from './Chat';
import { Dashboard } from './Dashboard';
import { CoursePage } from './CoursePage';
import { CoursesPane } from '../components/course/CoursesPane';
import { TabBar } from '../components/TabBar';
import { PublicChat } from '../components/PublicChat';
import { Box } from '@material-ui/core';
import { ChatPane } from '../components/ChatPane';
import { CreateGroup } from './CreateGroup';
import { GroupSettings } from './GroupSettings';
import { GroupChat } from './GroupChat';
import { PrivateChat } from '../components/PrivateChat';
import { CourseFeed } from '../components/feed/CourseFeed';
import { MakePost } from '../components/feed/MakePost';
import { PostExpanded } from '../components/feed/PostExpanded';
import { CourseAdminPage } from './CourseAdminPage';
import { KudoDashboard } from './KudoDashboard';
import { Scrollbars } from 'react-custom-scrollbars';
import { UserAccountBox } from './UserAccountBox';

export const useStyles = makeStyles(theme => ({
  kudoApp: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 8fr 1.5fr',
    gridTemplateRows: '1fr 15fr',
    gridTemplateAreas: `"leftTitle tabs rightTitle"
                        "left middle right"
                        "left middle right"`,
    height: '100vh',
    width: '100%',
    fontSize: '2rem',
  },

  topTabBar: {
    gridArea: 'tabs',
    background: 'red',
  },

  leftPaneTitle: {
    gridArea: 'leftTitle',
    background: theme.palette.secondary,
  },
  leftPane: {
    display: 'flex',
    flexDirection: 'column',
    gridArea: 'left',
  },

  rightPaneTitle: {
    gridArea: 'rightTitle',
  },
  rightPane: {
    gridArea: 'right',
    background: theme.palette.background.level2,
    display: 'flex',
  },

  contentArea: {
    height: '100%',
    gridArea: 'middle',
    maxWidth: 'calc((8/11) * 100vw)',
    background: theme.palette.background.level1,
  },
  pane: {
    background: theme.palette.secondary,
  },
}));

const Kudo = () => {
  const classes = useStyles();

  return (
    <div className={classes.kudoApp}>
      <SacredTopBar />
      <SacredLeftPane />
      <SacredRightPane />
      <PlebbyChangingContent />
    </div>
  );
};

const SacredLeftPane = () => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <PaneTitle title="COURSES" className={classes.leftPaneTitle} />
      <div className={classes.leftPane}>
        <CoursesPane />
      </div>
    </React.Fragment>
  );
};

const SacredRightPane = () => {
  const classes = useStyles();
  return (
    <React.Fragment>
      {/* <PaneTitle title="PEERS" className={classes.rightPaneTitle} /> */}
      <UserAccountBox />
      <div className={classes.rightPane}>
        <ChatPane />
      </div>
    </React.Fragment>
  );
};

const SacredTopBar = () => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <div className={classes.topTabBar}>
        <TabBar />
      </div>
    </React.Fragment>
  );
};

const PlebbyChangingContent = () => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <div className={classes.contentArea}>
        <Switch>
          <Route path={makePath('/dashboard')}>
            <Scrollbars autoHide>
              <KudoDashboard />
            </Scrollbars>
          </Route>

          <Route exact path={makePath('/:course/dashboard')}>
            <Scrollbars autoHide>
              <CoursePage />
            </Scrollbars>
          </Route>

          <Route exact path={makePath('/:course/admin')}>
            <Scrollbars autoHide>
              <CourseAdminPage />
            </Scrollbars>
          </Route>

          <Route exact path={makePath('/:course/chat')}>
            <PublicChat />
          </Route>
          <Route exact path={makePath('/:course/chat/:user')}>
            <PrivateChat />
          </Route>

          <Route exact path={makePath('/:course/feed')}>
            <CourseFeed />
          </Route>
          <Route exact path={makePath('/:course/feed/new')}>
            <MakePost />
          </Route>
          <Route exact path={makePath('/:course/post/:postId')}>
            <PostExpanded />
          </Route>

          <Route exact path={makePath('/:course/group/create')}>
            <CreateGroup />
          </Route>
          <Route exact path={makePath('/:course/group/:group')}>
            <GroupChat />
          </Route>
          <Route exact path={makePath('/:course/group/:group/settings')}>
            <GroupSettings />
          </Route>
        </Switch>
      </div>
    </React.Fragment>
  );
};

// TODO: we can potentially even get rid of the kudo prefix
export const makePath = path => {
  return `/kudo${path}`;
};
const PaneTitle = ({ title, ...props }) => {
  return (
    <Box
      py={2}
      textAlign="center"
      justifyContent="center"
      alignItems="center"
      borderBottom="1px solid darkgrey"
      bgcolor="primary.main"
      color="#f5f5f5"
      fontSize="h6.fontSize"
      fontWeight="fontWeightMedium"
      {...props}
    >
      {title}
    </Box>
  );
};

export { Kudo };
