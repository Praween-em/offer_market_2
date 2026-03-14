import React, { useRef, useState } from 'react';
import {
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../theme/theme';

interface SelfieCameraModalProps {
    visible: boolean;
    onClose: () => void;
    onCapture: (uri: string) => void;
    cameraType?: 'front' | 'back';
    title?: string;
    instruction?: string;
}

const SelfieCameraModal: React.FC<SelfieCameraModalProps> = ({
    visible,
    onClose,
    onCapture,
    cameraType = 'front',
    title,
    instruction,
}) => {
    const cameraRef = useRef<any>(null);
    const [capturing, setCapturing] = useState(false);

    const isBusiness = cameraType === 'back';

    const headerTitle = title ?? (isBusiness ? 'Capture Shop Front' : 'Take a Selfie');
    const instructionText = instruction ?? (
        isBusiness
            ? 'Position the shop sign / entrance clearly in frame'
            : 'Position your face within the frame'
    );

    const handleCapture = async () => {
        if (cameraRef.current && !capturing) {
            setCapturing(true);
            try {
                // Pass an empty object or options object, NOT boolean
                const image = await cameraRef.current.capture({});
                // image.uri is usually returned
                if (image && image.uri) {
                    onCapture(image.uri);
                    onClose();
                } else {
                    Alert.alert('Error', 'Failed to capture image');
                }
            } catch (error) {
                console.error('Capture error:', error);
                Alert.alert('Error', 'Failed to capture image');
            } finally {
                setCapturing(false);
            }
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Icon name="x" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{headerTitle}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.cameraContainer}>
                    <Camera
                        ref={cameraRef}
                        style={styles.camera}
                        cameraType={isBusiness ? CameraType.Back : CameraType.Front}
                        flashMode="auto"
                        focusMode="on"
                        zoomMode="on"
                    />

                    {/* Overlay */}
                    <View style={styles.overlayContainer}>
                        {isBusiness ? (
                            /* Rectangular shop frame */
                            <View style={styles.shopFrame}>
                                <View style={styles.shopCornerTL} />
                                <View style={styles.shopCornerTR} />
                                <View style={styles.shopCornerBL} />
                                <View style={styles.shopCornerBR} />

                                {/* Shop icon hint in centre */}
                                <View style={styles.shopHint}>
                                    <Icon name="home" size={28} color="rgba(255,255,255,0.6)" />
                                </View>
                            </View>
                        ) : (
                            /* Oval face frame */
                            <View style={styles.faceFrame}>
                                <View style={styles.cornerTL} />
                                <View style={styles.cornerTR} />
                                <View style={styles.cornerBL} />
                                <View style={styles.cornerBR} />
                            </View>
                        )}
                        <Text style={styles.instructionText}>{instructionText}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    {isBusiness && (
                        <Text style={styles.tipText}>
                            💡 Tip: Capture the shop sign &amp; entrance in good lighting
                        </Text>
                    )}
                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={handleCapture}
                        disabled={capturing}
                    >
                        {capturing ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <View style={styles.captureInner} />
                        )}
                    </TouchableOpacity>
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
        zIndex: 10,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
    },
    cameraContainer: {
        flex: 1,
        position: 'relative',
    },
    camera: {
        flex: 1,
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    /* ── Oval face frame (individual) ── */
    faceFrame: {
        width: 280,
        height: 350,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 150,
        backgroundColor: 'transparent',
        position: 'relative',
        marginBottom: 40,
    },
    cornerTL: {
        position: 'absolute', top: -2, left: -2,
        width: 40, height: 40,
        borderTopWidth: 4, borderLeftWidth: 4,
        borderColor: COLORS.success,
        borderTopLeftRadius: 150,
    },
    cornerTR: {
        position: 'absolute', top: -2, right: -2,
        width: 40, height: 40,
        borderTopWidth: 4, borderRightWidth: 4,
        borderColor: COLORS.success,
        borderTopRightRadius: 150,
    },
    cornerBL: {
        position: 'absolute', bottom: -2, left: -2,
        width: 40, height: 40,
        borderBottomWidth: 4, borderLeftWidth: 4,
        borderColor: COLORS.success,
        borderBottomLeftRadius: 150,
    },
    cornerBR: {
        position: 'absolute', bottom: -2, right: -2,
        width: 40, height: 40,
        borderBottomWidth: 4, borderRightWidth: 4,
        borderColor: COLORS.success,
        borderBottomRightRadius: 150,
    },
    /* ── Rectangular shop frame (business) ── */
    shopFrame: {
        width: 300,
        height: 220,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        borderRadius: 8,
        backgroundColor: 'transparent',
        position: 'relative',
        marginBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shopHint: {
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.5,
    },
    shopCornerTL: {
        position: 'absolute', top: -2, left: -2,
        width: 28, height: 28,
        borderTopWidth: 4, borderLeftWidth: 4,
        borderColor: '#FBC02D',
        borderTopLeftRadius: 8,
    },
    shopCornerTR: {
        position: 'absolute', top: -2, right: -2,
        width: 28, height: 28,
        borderTopWidth: 4, borderRightWidth: 4,
        borderColor: '#FBC02D',
        borderTopRightRadius: 8,
    },
    shopCornerBL: {
        position: 'absolute', bottom: -2, left: -2,
        width: 28, height: 28,
        borderBottomWidth: 4, borderLeftWidth: 4,
        borderColor: '#FBC02D',
        borderBottomLeftRadius: 8,
    },
    shopCornerBR: {
        position: 'absolute', bottom: -2, right: -2,
        width: 28, height: 28,
        borderBottomWidth: 4, borderRightWidth: 4,
        borderColor: '#FBC02D',
        borderBottomRightRadius: 8,
    },
    instructionText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 16,
        paddingHorizontal: 24,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    footer: {
        minHeight: 120,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 8,
        gap: 10,
    },
    tipText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    captureButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#000',
    },
});

export default SelfieCameraModal;
