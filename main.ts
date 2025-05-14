/**
 * Robots Bluetooth-Steuerung
 */

enum RobotAppType {
    //% block="Face-App"
    FaceApp,
    //% block="Control"
    Control
}

enum FaceValues {
    //% block="X"
    X,
    //% block="Y"
    Y,
    //% block="Z"
    Z,
    //% block="Yaw"
    Yaw,
    //% block="Pitch"
    Pitch,
    //% block="Mouth"
    Mouth,
    //% block="Left Eye"
    LeftEye,
    //% block="Right Eye"
    RightEye,
    //% block="Roll"
    Roll,
    //% block="Smile"
    Smile,
    //% block="Face Visible"
    FaceVisible
}

enum ControlValues {
    //% block="Joystick X"
    XValue,
    //% block="Steuerung"
    Control
}

namespace robots {
    // Face-App Variablen
    let face_x = 0
    let face_y = 0
    let face_z = 0
    let face_yaw = 0
    let face_pitch = 0
    let face_mouth = 0
    let face_left_eye = 0
    let face_right_eye = 0
    let face_roll = 0
    let face_smile = 0
    let face_visible = 0

    // Control Variablen
    let control_x_value = 0
    let control_command = ""
    let control_value = 0

    let receivedString = ""
    let currentApp = RobotAppType.FaceApp
    let bluetoothStarted = false

    /**
     * Starte den Bluetooth-Dienst für die Robotersteuerung
     */
    //% block="Starte Bluetooth"
    //% weight=100
    export function startBluetooth(): void {
        if (!bluetoothStarted) {
            bluetooth.startUartService()
            basic.showIcon(IconNames.Square)
            bluetoothStarted = true
        }
    }

    /**
     * Wird ausgeführt, wenn eine Bluetooth-Verbindung hergestellt wurde
     * @param handler Code, der ausgeführt werden soll
     */
    //% block="wenn Bluetooth verbunden"
    //% weight=90
    export function onBluetoothConnected(handler: () => void): void {
        bluetooth.onBluetoothConnected(handler)
    }

    /**
     * Wird ausgeführt, wenn eine Bluetooth-Verbindung getrennt wurde
     * @param handler Code, der ausgeführt werden soll
     */
    //% block="wenn Bluetooth getrennt"
    //% weight=80
    export function onBluetoothDisconnected(handler: () => void): void {
        bluetooth.onBluetoothDisconnected(handler)
    }

    /**
     * Wird ausgeführt, wenn Bluetooth-Daten empfangen werden
     * @param appType Wähle die App (Face-App oder Control)
     * @param handler Code, der ausgeführt werden soll
     */
    //% block="wenn Bluetooth-Daten empfangen %appType"
    //% weight=70
    export function onUartDataReceived(appType: RobotAppType, handler: () => void): void {
        currentApp = appType
        
        bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), () => {
            receivedString = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
            
            if (currentApp === RobotAppType.FaceApp) {
                // Face-App Datenverarbeitung
                face_x = parseFloat(receivedString.substr(0, 2))
                face_y = parseFloat(receivedString.substr(2, 2))
                face_z = parseFloat(receivedString.substr(4, 2))
                face_yaw = parseFloat(receivedString.substr(6, 2))
                face_pitch = parseFloat(receivedString.substr(8, 2))
                face_mouth = parseFloat(receivedString.substr(10, 2))
                face_left_eye = parseFloat(receivedString.substr(12, 2))
                face_right_eye = parseFloat(receivedString.substr(14, 2))
                face_roll = parseFloat(receivedString.substr(16, 1))
                face_smile = parseFloat(receivedString.substr(17, 1))
                face_visible = parseFloat(receivedString.substr(18, 1))
            } else if (currentApp === RobotAppType.Control) {
                // Control-App Verarbeitung
                control_command = receivedString
                if (receivedString === "up") {
                    basic.showIcon(IconNames.ArrowNorth)
                    control_value = 100
                } else if (receivedString === "down") {
                    basic.showIcon(IconNames.ArrowSouth)
                    control_value = 50
                } else if (receivedString === "left") {
                    basic.showIcon(IconNames.ArrowWest)
                    control_value = 25
                } else if (receivedString === "right") {
                    basic.showIcon(IconNames.ArrowEast)
                    control_value = 75
                } else if (receivedString === "horn") {
                    basic.showIcon(IconNames.EighthNote)
                    control_value = 90
                } else if (receivedString === "stop") {
                    basic.showIcon(IconNames.SmallSquare)
                    control_value = 0
                } else if (receivedString.charAt(0) === "x" || receivedString.charAt(0) === "c") {
                    control_x_value = parseFloat(receivedString.substr(1, 3))
                    led.plotBarGraph(control_x_value, 180)
                }
            }
            
            handler()
        })
    }

    /**
     * Zeigt ein Säulendiagramm mit dem gewählten Face-App Wert an
     * @param valueType Wähle den Face-App Wert, der angezeigt werden soll
     */
    //% block="zeige Säulendiagramm für Face-App Wert %valueType"
    //% weight=60
    export function showFaceBarGraph(valueType: FaceValues): void {
        let valueToShow = 0
        let maxValue = 100
        
        switch (valueType) {
            case FaceValues.X:
                valueToShow = face_x
                break
            case FaceValues.Y:
                valueToShow = face_y
                break
            case FaceValues.Z:
                valueToShow = face_z
                break
            case FaceValues.Yaw:
                valueToShow = face_yaw
                break
            case FaceValues.Pitch:
                valueToShow = face_pitch
                break
            case FaceValues.Mouth:
                valueToShow = face_mouth
                break
            case FaceValues.LeftEye:
                valueToShow = face_left_eye
                break
            case FaceValues.RightEye:
                valueToShow = face_right_eye
                break
            case FaceValues.Roll:
                valueToShow = face_roll
                break
            case FaceValues.Smile:
                valueToShow = face_smile
                break
            case FaceValues.FaceVisible:
                valueToShow = face_visible
                break
        }
        
        led.plotBarGraph(valueToShow, maxValue)
    }

    /**
     * Zeigt ein Säulendiagramm mit dem gewählten Control Wert an
     * @param valueType Wähle den Control Wert, der angezeigt werden soll
     */
    //% block="zeige Säulendiagramm für Control Wert %valueType"
    //% weight=55
    export function showControlBarGraph(valueType: ControlValues): void {
        let valueToShow = 0
        let maxValue = 100
        
        switch (valueType) {
            case ControlValues.XValue:
                valueToShow = control_x_value
                maxValue = 180
                break
            case ControlValues.Control:
                valueToShow = control_value
                break
        }
        
        led.plotBarGraph(valueToShow, maxValue)
    }

    /**
     * Gibt den ausgewählten Face-App Wert zurück
     * @param value Wähle den Wert, der zurückgegeben werden soll
     */
    //% block="Face-App Wert %value"
    //% weight=50
    export function getFaceValue(value: FaceValues): number {
        switch (value) {
            case FaceValues.X:
                return face_x
            case FaceValues.Y:
                return face_y
            case FaceValues.Z:
                return face_z
            case FaceValues.Yaw:
                return face_yaw
            case FaceValues.Pitch:
                return face_pitch
            case FaceValues.Mouth:
                return face_mouth
            case FaceValues.LeftEye:
                return face_left_eye
            case FaceValues.RightEye:
                return face_right_eye
            case FaceValues.Roll:
                return face_roll
            case FaceValues.Smile:
                return face_smile
            case FaceValues.FaceVisible:
                return face_visible
            default:
                return 0
        }
    }

    /**
     * Gibt den ausgewählten Control Wert zurück
     * @param value Wähle den Wert, der zurückgegeben werden soll
     */
    //% block="Control Wert %value"
    //% weight=45
    export function getControlValue(value: ControlValues): number {
        switch (value) {
            case ControlValues.XValue:
                return control_x_value
            case ControlValues.Control:
                return control_value
            default:
                return 0
        }
    }

    // Interne Funktion - nicht als Block verfügbar
    function getLastCommand(): string {
        return receivedString
    }
}
