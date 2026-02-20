import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, StyleProp, TextStyle } from 'react-native';

interface CountdownTimerProps {
    targetDate: Date;
    style?: StyleProp<TextStyle>;
    prefix?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, style, prefix = 'Offer ends in ' }) => {
    const calculateTimeLeft = () => {
        const difference = +targetDate - +new Date();
        let timeLeft = {
            hours: 0,
            minutes: 0,
            seconds: 0,
        };

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const formatTime = (time: number) => {
        return time < 10 ? `0${time}` : time;
    };

    return (
        <Text style={[styles.timerText, style]}>
            {prefix}{formatTime(timeLeft.hours)}h {formatTime(timeLeft.minutes)}m {formatTime(timeLeft.seconds)}s
        </Text>
    );
};

const styles = StyleSheet.create({
    timerText: {
        color: '#FF3B30',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default CountdownTimer;
