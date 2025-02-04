/* eslint-disable react/prop-types */
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useFormik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import * as yup from 'yup';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { updateChannelName } from '../../../store/channelSlice';
import API_ROUTES from '../../../api';
import socket from '../../../socket';

const SwitchNameChannel = ({ show, onHide, id }) => {
  const { t } = useTranslation();
  const notifySuccess = () => toast.success(t('noticeChannelRenamed'));
  const notifyError = () => toast.warning(t('errNetwork'));
  const dispatch = useDispatch();
  const channelsList = useSelector((state) => state.channels.entities);
  const channelsData = Object.values(channelsList);
  const existingNames = channelsData.map((channel) => channel.name);

  const { name, id: curId } = channelsData.find((channel) => channel.id === id);

  useEffect(() => {
    socket.on('renameChannel', (payload) => {
      dispatch(updateChannelName(payload));
    });
  }, [dispatch, id]);

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .min(3, 'Минимум 3 символа')
      .max(20, 'Максимум 20 символов')
      .required('Имя обязательно')
      .notOneOf(existingNames, 'Канал с таким именем уже существует'),
  });

  const formik = useFormik({
    initialValues: {
      name,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const token = localStorage.getItem('token');

      await axios
        .patch(API_ROUTES.channels.channelById(curId), values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          const newChannelName = values.name;
          dispatch(updateChannelName({ id, name: newChannelName }));
          notifySuccess();
        })
        .catch((error) => {
          if (error.status === 500) notifyError();
        })
        .finally(() => {
          setSubmitting(false);
        });
      onHide();
    },
  });

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Переименовать канал</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="mb-3" onSubmit={formik.handleSubmit}>
          {/* eslint-disable jsx-a11y/label-has-associated-control */}
          <label className="visually-hidden" htmlFor="name">
            Имя канала
          </label>
          {/* eslint-enable jsx-a11y/label-has-associated-control */}
          {/* eslint-disable jsx-a11y/no-autofocus */}
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            onChange={formik.handleChange}
            value={formik.values.name}
            autoFocus
          />
          {/* eslint-enable jsx-a11y/no-autofocus */}
          <span className="bg-warning">
            {formik.errors.name ? formik.errors.name : null}
          </span>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Закрыть
        </Button>
        <Button
          variant="primary"
          type="submit"
          onClick={formik.handleSubmit}
          disabled={formik.isSubmitting}
        >
          Переименовать
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SwitchNameChannel;
