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
      var data = doc.data();
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
    if (this.state.isConnected) {
        this.unsubscribe();}
  }

  onSend(messages = []) {
    const newMessage = messages[0]
    this.referenceChatMessages.add({
        _id: newMessage._id,
        text: newMessage.text,
        createdAt: newMessage.createdAt,
        user: newMessage.user,
        system: false,
    });
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
            let color;
            if (this.props.route.params.color === '#090C08') color = '#8A95A5'
            else if (this.props.route.params.color === '#474056') color = '#B9C6AE'
            else if (this.props.route.params.color === '#8A95A5') color = '#B9C6AE'
            else if (this.props.route.params.color === '#B9C6AE') color = '#474056'
        
            return (
            <Bubble
                {...props}
                wrapperStyle={{
                    left: {
                        backgroundColor: '#fafafa',
                      },
                    right: {
                        backgroundColor: '#2d7ecf',
                    }
                }}
            />
        )
    }
    renderDay(props) {
        return <Day {...props} textStyle={{ color: 'white' }} />
    }
    renderTime(props) {
        return (
            <Time
                {...props}
                timeTextStyle={{
                    left: {
                        color: 'black',
                    },
                    right: {
                        color: 'white',
                    },
                }}
            />
        );
    };
    renderSystemMessage(props) {
        return <SystemMessage {...props} textStyle={{ color: 'white', fontFamily: 'Poppins-Regular' }} />
    }
        render() {
            let color = this.props.route.params.color;
            // Set default background color if no color was selected
            if (color === '') {
              color = '#8A95A5';
            }

            return (
                <View style={[{ backgroundColor: color }, { flex: 1 }]}>
            <GiftedChat
                renderBubble={this.renderBubble.bind(this)}
                messages={this.state.messages}
                onSend={messages => this.onSend(messages)}
                user={{_id: this.state.user._id, name: this.state.user.name
                }}
            />
            {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
        </View>
        );
    }
}

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
