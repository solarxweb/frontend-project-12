import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import CreateChannel from './Channels/Modal/CreateChannel';
import SwitchChannelName from './Channels/Modal/ChangeNameChannel';
import MakeSureDelete from './Channels/Modal/MakeSureDelete';

const ModalContainer = () => {
  const { type, extra } = useSelector((state) => state.modal);
  useEffect(() => {
    console.log(`Modal type changed: ${type}\n Extra: ${extra}`);
  }, [type, extra]);

  const renderModal = () => {
    switch (type) {
      case 'rename':
        return <SwitchChannelName id={extra} />;
      case 'delete':
        return <MakeSureDelete id={extra} />;
      case 'create':
        return <CreateChannel />;
      default:
        return null;
    }
  };

  return (
    <>
      {renderModal()}
    </>
  );
};

export default ModalContainer;
