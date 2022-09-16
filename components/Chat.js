import React from 'react';
import { View, Text, Platform, KeyboardAvoidingView } from 'react-native';
import { StyleSheet,} from 'react-native';
import { GiftedChat, Bubble, InputToolbar} from 'react-native-gifted-chat';
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from '@react-native-community/netinfo';

import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import MapView from 'react-native-maps';

import firebase from "firebase";
import "firebase/firestore";

import CustomActions from './CustomActions.js';


export default class Chat extends React.Component {
    // LIFECYCLE METHODS
    constructor(props) {
      super();

      this.state = {
          messages: [],
          uid: 0,

          user: {
            _id: '',
            name: '',
        },
        isConnected: null,
        image: null,
        location: null

    };

    const firebaseConfig = {
      apiKey: "AIzaSyAzNOh03qrfCBrlyHEG6RpxWSeIlv5CiwA",
authDomain: "chat-app-7c633.firebaseapp.com",
projectId: "chat-app-7c633",
storageBucket: "chat-app-7c633.appspot.com",
messagingSenderId: "669406870933",
appId: "1:669406870933:web:af0d21bdcd11caa9580a9c",
measurementId: "G-8X2FMVW17D"
  };

  if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
  }

  this.referenceChatMessages = firebase.firestore().collection('messages');

}
componentDidMount() {
  // Set name as title chat
  let {name} = this.props.route.params;
  this.props.navigation.setOptions({title: name});

  // Check if user is offline or online
  NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
          this.setState({
              isConnected: true,
          });

          // Reference to load messages from Firebase
          this.referenceChatMessages = firebase
              .firestore()
              .collection('messages');

          // Authenticate user anonymously
          this.authUnsubscribe = firebase
              .auth()
              .onAuthStateChanged(async (user) => {
                  if (!user) {
                      firebase.auth().signInAnonymously();
                  }
                  this.setState({
                      uid: user.uid,
                      messages: [],
                      user: {
                          _id: user.uid,
                          name: name,
                      },
                  });
                  this.unsubscribe = this.referenceChatMessages
                      .orderBy('createdAt', 'desc')
                      .onSnapshot(this.onCollectionUpdate);
              });
      } else {
          this.setState({
              isConnected: false,
          });
          this.getMessages();
      }
  });
}

componentWillUnmount() {
  if (this.isConnected) {
      this.unsubscribe();
      this.authUnsubscribe();
  }
}


onCollectionUpdate = (querySnapshot) => {
  const messages = [];
  // go through each document
  querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
          _id: data._id,
          text: data.text,
          createdAt: data.createdAt.toDate(),
          user: {
              _id: data.user._id,
              name: data.user.name,
          },
          image: data.image || null,
          location: data.location || null,
      });
  });
  this.setState({
      messages,
  });
};


async getMessages() {
  let messages = '';
  try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
          messages: JSON.parse(messages)
      });
  } catch (error) {
      console.log(error.message);
  }
};

async saveMessages() {
  try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
  } catch (error) {
      console.log(error.message);
  }
}


// delete function for testing
async deleteMessages() {
  try {
      await AsyncStorage.removeItem('messages');
      this.setState({
          messages: []
      })
  } catch (error) {
      console.log(error.message);
  }
}


// Add messages to Firebase
addMessages(message) {
  this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: message.user,
      image: message.image || null,
      location: message.location || null,

  });
}

onSend(messages = []) {
  this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
  }), () => {
      this.addMessages(this.state.messages[0]);
      this.saveMessages()
      this.deleteMessages()
  })

}

renderBubble(props) {
    let bubbleColor;
        if (this.props.route.params.color === '#090C08') bubbleColor = '#8A95A5'
        else if (this.props.route.params.color === '#474056') bubbleColor = '#a1ad97'
        else if (this.props.route.params.color === '#8A95A5') bubbleColor = '#a1ad97'
        else if (this.props.route.params.color === '#B9C6AE') bubbleColor = '#474056'
  return (
      <Bubble
          {...props}
          wrapperStyle={{
              right: {
                backgroundColor: bubbleColor
            }
        }}
        textStyle={{
          right: {
              color: 'white'
          } }}
      />
  )
}


renderInputToolbar(props) {
  if (this.state.isConnected == false) {
  } else {
      return (
          <InputToolbar
              {...props}
          />
      );
  }
}

renderCustomView(props) {
  const {currentMessage} = props;
  if (currentMessage.location) {
      return (
          <MapView
              style={{width: 150, height: 100, borderRadius: 13, margin: 3}}
              region={{
                  latitude: currentMessage.location.latitude,
                  longitude: currentMessage.location.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
              }}
          />
      );
  }
  return null;
}


renderCustomActions = (props) => {
  return <CustomActions {...props} />;
};

render() {
    const { color } = this.props.route.params;
    const { uid } = this.state;
  return (

    <View style={[styles.container, { backgroundColor: color }]}>
    <GiftedChat
       renderInputToolbar={this.renderInputToolbar.bind(this)}
       renderActions={this.renderCustomActions}
       renderBubble={this.renderBubble.bind(this)}
       renderCustomView={this.renderCustomView}
       messages={this.state.messages}
       onSend={messages => this.onSend(messages)}
       user={{_id: this.state.user._id, name: this.state.user.name}}
    />
          {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height"/> : null
          }
      </View>

  )
}
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
  })