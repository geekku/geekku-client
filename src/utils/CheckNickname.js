import axios from 'axios';
import { Modal } from 'antd';

export const CheckNickname = async (nickname, url) => {
  if (!nickname) {
    Modal.info({
      content: '닉네임을 입력해주세요.',
    });
    return false;
  }

  try {
    const response = await axios.get(`${url}/checkNickname`, {
      params: { nickname },
    });
    if (response.data === true) {
      Modal.error({
        content: '이미 사용중인 닉네임입니다.',
      });
      return false;
    } else {
      Modal.success({
        content: '사용 가능한 닉네임입니다.',
      });
      return true;
    }
  } catch (err) {
    const errorMessage =
      err.response?.data || '닉네임 중복 확인을 실패했습니다';
    Modal.error({
      content: errorMessage,
    });
    console.error(err);
    return false;
  }
};
