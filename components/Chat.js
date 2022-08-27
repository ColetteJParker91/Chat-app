import React, { Component } from 'react';
import { GiftedChat, Bubble, SystemMessage, Day, Time} from 'react-native-gifted-chat';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { StyleSheet } from 'react-native';


export default class Chat extends Component {
    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }))
    }
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
                    right: {
                        backgroundColor: 'color'
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
        return 
            <SystemMessage {...props} textStyle={{ color: 'white' }} />
        
    }

    constructor() {
        super();
        this.state = {
            messages: [],
        }
    }
 
    render() {
        const { color } = this.props.route.params;
    return (
        <View style={[styles.container, { backgroundColor: color }]}>
            <GiftedChat
                renderBubble={this.renderBubble.bind(this)}
                renderDay={this.renderDay.bind(this)}
                renderTime={this.renderTime.bind(this)}
                renderSystemMessage={this.renderSystemMessage.bind(this)}
                messages={this.state.messages}
                onSend={messages => this.onSend(messages)}
                user={{
                    _id: 1,
                }}
            />
            {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
        </View>
        );
    }

componentDidMount() {
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });
    this.setState({
        messages: [
            {
                _id: 1,
                text: 'Hello developer',
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'React Native',
                    avatar: 'https://placeimg.com/140/140/any',
                },
            },
            {
                _id: 2,
                text: '${name} has entered the chat',
                createdAt: new Date(),
                system: true,
            },
        ],
    })
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