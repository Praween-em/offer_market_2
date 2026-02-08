import React from 'react';
import {
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    SafeAreaView,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import Icon from 'react-native-vector-icons/Feather';

interface QRScannerModalProps {
    visible: boolean;
    onClose: () => void;
    onReadCode: (code: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ visible, onClose, onReadCode }) => {
    const [torch, setTorch] = React.useState<'on' | 'off'>('off');

    React.useEffect(() => {
        if (visible) {
            console.log('[QRScannerModal] Modal Mounted and Visible');
        }
    }, [visible]);

    const handleClose = () => {
        console.log('[QRScannerModal] Closing Modal');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Icon name="x" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Scan Aadhaar QR Code</Text>
                    <TouchableOpacity onPress={() => setTorch(torch === 'on' ? 'off' : 'on')} style={styles.closeButton}>
                        <Icon name="zap" size={24} color={torch === 'on' ? '#FFD700' : '#FFF'} />
                    </TouchableOpacity>
                </View>

                <View style={styles.cameraContainer}>
                    <Camera
                        style={styles.camera}
                        scanBarcode={true}
                        onReadCode={(event: any) => {
                            const code = event.nativeEvent.codeStringValue;
                            console.log('[QRScannerModal] Scanned:', code);
                            if (code) {
                                onReadCode(code);
                            }
                        }}
                        allowedBarcodeTypes={['qr']}
                        torchMode={torch}
                        focusMode="on"
                        zoomMode="on"
                        showFrame={true}
                        laserColor="red"
                        frameColor="white"
                        barcodeFrameSize={{ width: 280, height: 280 }}
                        scanThrottleDelay={1000}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Position the QR code within the frame to scan
                    </Text>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        backgroundColor: '#000',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    closeButton: {
        padding: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    footerText: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 14,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 20,
    },
});

export default QRScannerModal;
