import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Chatkit } from '../App';

const useStyles = makeStyles(theme => ({}));

const Messages = ({ messages }) =>
  !messages.length ? (
    'Loading messages'
  ) : (
    <ul>
      {messages.map(m => {
        return <li key={m.id}>{m.parts[0].payload.content}</li>;
      })}
    </ul>
  );

function PublicChat(props) {
  const classes = useStyles();
  const chatkit = React.useContext(Chatkit);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = React.useState([]);
  const [incomingMessage, setIncomingMessage] = React.useState(null);

  const roomId = props.forCourse +"_public";
  console.log(roomId);

  React.useEffect(() => {
    if (!incomingMessage) return;
    setChatMessages([...chatMessages, incomingMessage]);
  }, [incomingMessage]);

  const handleOnMessage = message => {
    setIncomingMessage(message);
  };

  React.useEffect(() => {
    chatkit.user
      .fetchMultipartMessages({ roomId })
      .then(messages => {
        setChatMessages([...messages]);
        return chatkit.user.subscribeToRoomMultipart({
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

  const handleChange = event => {
    setMessage(event.target.value);
  };

  const handleClick = async event => {
    try {
      setMessage('');
      await chatkit.user.sendSimpleMessage({
        text: message,
        roomId: roomId,
      });
    } catch (err) {
      throw Error(`Sending message via Chatkit fucked up: ${err}`);
    } finally {
    }
  };
  // fetch messages from all chat
  // subscribe to all chat
  // send message to all chat
  return (
    <div className={classes.yourClassname}>
      <Messages messages={chatMessages} />
      <input type="text" onChange={handleChange} value={message} />
      <button onClick={handleClick}>Send a message!</button>
    </div>
  );
}

export { PublicChat };
