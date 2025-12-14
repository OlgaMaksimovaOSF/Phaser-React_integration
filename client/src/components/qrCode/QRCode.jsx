import QRCodeCmp from 'react-qr-code';

const QRCode = (props) => {

    const {gameId} = props;
    const controllerLink = import.meta.env.VITE_BASE_URL + `/controller/${gameId}`;
    

    return (
        <div>
            <QRCodeCmp value={controllerLink} />
            <p>Scan this QR code to join the game as a controller</p>
            <p>{controllerLink}</p>
            
        </div>
    )
}

export default QRCode