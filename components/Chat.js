import React, { Component } from 'react';
import { GiftedChat, Bubble, SystemMessage, Day, Time} from 'react-native-gifted-chat';
import { View, Platform, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';

const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends Component {
    constructor() {
        super();
        this.state = {
            messages: [],
            uid: 0,
      user: {
        _id: "",
        name: "",
        },
    }
 // Set up firebase
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

  // Reference to Firestore collection
  this.referenceChatMessages = firebase.firestore().collection('messages');
}

onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // Go through each document
    querySnapshot.forEach((doc) => {
      // Get the QueryDocumentsSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
        },
      });
    });
    this.setState({
      messages,
    });
  };

  componentDidMount() {
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });

    // Reference to load messages from Firebase
    this.referenceChatMessages = firebase.firestore().collection('messages');

    // Authenticate user anonymously
    this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
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
  }
  componentWillUnmount() {
    this.unsubscribe();
  }

    onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        // Call addMessage with last message in message state
        this.addMessages(this.state.messages[0]);
      }
    );
  }
// Add message to Firestore
addMessages = (message) => {
    this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      user: message.user,
    });
  };

    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: 'blue'
                    }
                }}
            />
        )
    }
 
        render() {
            let { color, name } = this.props.route.params;
            // Set default background color if no color was selected
            if (color === '') {
              color = '#8A95A5';
    return (
        <View style={[styles.container, { backgroundColor: color }]}>
            <GiftedChat
                renderBubble={this.renderBubble.bind(this)}
                renderDay={this.renderDay.bind(this)}
                renderSystemMessage={this.renderSystemMessage.bind(this)}
                messages={this.state.messages}
                onSend={messages => this.onSend(messages)}
                user={{_id: this.state.user._id, name: this.state.user.name
                }}
            />
            {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
        </View>
        );
    }
}}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#FFFFFF',
    },
})