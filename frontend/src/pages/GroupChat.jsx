import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Message } from '../components/Message';
import { MessageInput } from '../components/MessageInput';
import { useParams } from 'react-router-dom';
import { Session } from '../App';

const useStyles = makeStyles(theme => ({
  messages: {
    height: '500px',
    overflow: 'auto',
  },
}));

const Messages = ({ messages }) =>
  !messages.length ? (
    'Loading messages'
  ) : (
    <ul>
      {messages.map(m => {
        return <Message key={m.id} msg={m} />;
      })}
    </ul>
  );

const makeGroupId = (groupName, course) => {
  return `__group__|${course}|${groupName}`;
};

function GroupChat() {
  const classes = useStyles();
  const session = React.useContext(Session);
  const [chatMessages, setChatMessages] = React.useState([]);
  const [incomingMessage, setIncomingMessage] = React.useState(null);

  const { course, group } = useParams();
  const roomId = makeGroupId(group, course);

  React.useEffect(() => {
    if (!incomingMessage) return;
    setChatMessages([...chatMessages, incomingMessage]);
  }, [incomingMessage]);

  const handleOnMessage = message => {
    setIncomingMessage(message);
  };

  React.useEffect(() => {
    session.user
      .fetchMultipartMessages({ roomId })
      .then(messages => {
        setChatMessages([...messages]);
        return session.user.subscribeToRoomMultipart({
          roomId: roomId,
          hooks: {
            onMessage: handleOnMessage,
          },
          messageLimit: 0, // Don't fetch, and notify about, old messages
        });
      })
      .catch(err => {
        console.log(`Chatkit: Error fetching messages: ${err}`);
      })
      .then(magicObj => {
        console.info(`room subscription successful:`, magicObj);
      })
      .catch(err => {
        console.log(`Chatkit: Error fetching messages: ${err}`);
      });
  }, [roomId]);

  // fetch messages from all chat
  // subscribe to all chat
  // send message to all chat
  return (
    <div className={classes.yourClassname}>
      <div className={classes.messages}>
        <Messages messages={chatMessages} />
      </div>
      <MessageInput roomId={roomId} />
    </div>
  );
}

export { GroupChat };
