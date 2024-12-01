import loginLogo from 'assets/images/login/loginLogo.png';
import checkRadio from 'assets/images/join/CheckedRadioBtn.png';
import unCheckRadio from 'assets/images/join/UncheckedRadioBtn.png';
import styles from '../login/Login.module.scss';
import styles2 from './Join.module.scss';
import JoinModal from './modals/JoinModal';
import axios from 'axios';
import { url } from 'lib/axios';
import { Modal } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkDoubleId } from './utils/CheckDoubleId';
import { useAgreements } from './utils/Agreements';
import { formatCompanyNum, verifyCompanyNum } from './utils/CompanyNumCheck';

const JoinCompany = () => {
  const [user, setUser] = useState({
    type: 'estate',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: '',
    companyNumber: '',
    ceoName: '',
    companyName: '',
    companyAddress: '',
    estateNumber: '',
    companyCertificationImage: '',
  });

  const [isModal, setIsModal] = useState(false);
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [estateInfoChecked, setEstateInfoChecked] = useState(false);
  const { agreements, handleCheckboxChange, validateAgreements } =
    useAgreements();
  const [preview, setPreview] = useState(null);

  const modalOpen = () => {
    setIsModal(true);
    setEstateInfoChecked(true);
  };
  const modalClose = () => {
    setIsModal(false);
  };

  const navigate = useNavigate();

  const edit = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsernameChecked(false);
    }
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleCheckDoubleId = async () => {
    const isAvailable = await checkDoubleId(user.username, url);
    setUsernameChecked(isAvailable);
  };

  const handleModalConfirm = (selectedData) => {
    //console.log('모달에서 전달된 데이터 : ', selectedData);
    setUser((prevUser) => {
      const updatedUser = {
        ...prevUser,
        estateNumber: selectedData.estateNumber,
        companyName: selectedData.companyName,
        ceoName: selectedData.ceoName,
        companyAddress: selectedData.companyAddress,
      };
      //console.log('업데이트된 user상태 :', updatedUser);
      return updatedUser;
    });
    setEstateInfoChecked(true);
    setIsModal(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setUser({ ...user, companyCertificationImage: file });
    }
  };

  const handleVerifyCompanyNumber = () => {
    const formattedNum = formatCompanyNum(user.companyNumber);
    verifyCompanyNum(user.companyNumber, setUser, user);
  };

  const submit = (e) => {
    e.preventDefault();

    // 필수 입력값 확인
    if (!user.username || !user.password || !user.phone || !user.email) {
      Modal.info({
        content: '필수 항목을 모두 입력해주세요.',
      });
      return;
    }

    // 아이디 중복확인
    if (!usernameChecked) {
      Modal.info({
        content: '아이디 중복 확인을 눌러주세요.',
      });
      return;
    }

    //동의 체크버튼
    if (!validateAgreements()) {
      return;
    }

    //비밀번호 검사
    // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    // if (!passwordRegex.test(user.password)) {
    //   alert('영문, 숫자를 포함한 8자 이상의 비밀번호를 입력해주세요.');
    //   return;
    // }
    if (user.password !== user.confirmPassword) {
      Modal.error({
        content: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      });
      return;
    }

    // 부동산 정보조회 여부 확인
    if (user.type === 'estate' && !estateInfoChecked) {
      Modal.info({
        content: '부동산 정보를 조회해주세요.',
      });
      return;
    }

    let formData = new FormData();
    formData.append('type', user.type);
    formData.append('username', user.username);
    formData.append('password', user.password);
    formData.append('phone', user.phone);
    formData.append('email', user.email);
    formData.append('companyNumber', user.companyNumber);
    formData.append('ceoName', user.ceoName);
    formData.append('companyName', user.companyName);
    formData.append('companyAddress', user.companyAddress);
    formData.append('estateNumber', user.estateNumber);

    const fileInput = document.getElementById('companyCertificationImage');
    if (fileInput && fileInput.files.length > 0) {
      formData.append('file', fileInput.files[0]);
    }

    axios
      .post(`${url}/joinCompany`, formData)
      .then((res) => {
        console.log(res.data);
        navigate('/login');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className={styles.login}>
      <img src={loginLogo} alt="로그인로고" className={styles.logo} />

      <h3 className={styles2.title}>기업 회원가입</h3>
      <div className={styles2.radioContainer}>
        <div className={styles2.checkRadio}>
          <img src={checkRadio} alt="체크라디오" />
          <b>부동산</b>
        </div>
        <div
          className={styles2.unCheckRadio}
          onClick={() => navigate('/JoinInterior')}
        >
          <img src={unCheckRadio} alt="언체크라디오" />
          <p>인테리어</p>
        </div>
      </div>
      <hr className={styles.line} />

      <div className={styles2.joinForm}>
        <div className={styles2.inputGroup}>
          <span>
            아이디<b>*</b>
          </span>
          <br />
          <input
            type="text"
            name="username"
            id="username"
            onChange={edit}
            placeholder="아이디를 입력해주세요."
            className={styles2.input1}
          />
          <button
            className={styles2.checkButton}
            onClick={handleCheckDoubleId}
            disabled={usernameChecked}
          >
            {usernameChecked ? '확인 완료' : '중복 확인'}
          </button>
        </div>

        <div className={styles2.inputGroup}>
          <span>
            비밀번호<b>*</b>
          </span>
          <br />
          <input
            type="password"
            name="password"
            id="password"
            onChange={edit}
            placeholder="영문, 숫자를 포함한 8자 이상의 비밀번호를 입력해주세요."
            className={styles2.input2}
          />
        </div>

        <div className={styles2.inputGroup}>
          <span>
            비밀번호 확인<b>*</b>
          </span>
          <br />
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            onChange={edit}
            placeholder="비밀번호를 다시 입력해주세요."
            className={styles2.input2}
          />
        </div>

        <div className={styles2.inputGroup}>
          <span>
            휴대폰 번호<b>*</b>
          </span>
          <br />
          <input
            type="text"
            name="phone"
            id="phone"
            onChange={edit}
            className={styles2.input2}
          />
        </div>

        <div className={styles2.inputGroup}>
          <span>
            이메일<b>*</b>
          </span>
          <br />
          <input
            type="text"
            name="email"
            id="email"
            onChange={edit}
            className={styles2.input2}
          />
        </div>
      </div>

      <hr className={styles.line} />
      <h3 className={styles2.title}>부동산 기업 회원정보</h3>

      <div className={styles2.joinForm}>
        <div className={styles2.inputGroup}>
          <input
            type="text"
            placeholder="조회 버튼으로 부동산 정보를 조회할 수 있습니다."
            className={styles2.input1}
            readOnly
          />
          <button
            className={`${styles2.checkButton} ${estateInfoChecked ? styles2.checked : ''}`}
            onClick={() => setIsModal(true)}
          >
            {estateInfoChecked ? '확인' : '조회'}
          </button>
        </div>
        <JoinModal
          open={isModal}
          close={() => setIsModal(false)}
          onConfirm={handleModalConfirm}
        />

        <div className={styles2.inputGroup}>
          <span>중개등록 번호</span>
          <br />
          <input
            type="text"
            value={user.estateNumber}
            className={styles2.input2}
            readOnly
          />
        </div>
        <div className={styles2.inputGroup}>
          <span>상호명</span>
          <br />
          <input
            type="text"
            value={user.companyName}
            className={styles2.input2}
            readOnly
          />
        </div>
        <div className={styles2.inputGroup}>
          <span>대표자명</span>
          <br />
          <input
            type="text"
            value={user.ceoName}
            className={styles2.input2}
            readOnly
          />
        </div>
        <div className={styles2.inputGroup}>
          <span>주소</span>
          <br />
          <input
            type="text"
            value={user.companyAddress}
            className={styles2.input2}
            readOnly
          />
        </div>
        <br />
        <div className={styles2.inputGroup}>
          <span>사업자 등록 번호 (선택) </span>
          <br />
          <input
            type="text"
            name="companyNumber"
            id="companyNumber"
            onChange={edit}
            placeholder="숫자 10자리를 입력해주세요."
            className={styles2.input1}
            value={user.companyNumber}
          />
          <button
            className={styles2.checkButton}
            onClick={handleVerifyCompanyNumber}
          >
            인증
          </button>
        </div>
        <div className={styles2.inputGroup}>
          <span>사업자 등록증 이미지 (선택)</span>
          <br />
          <div className={styles2.imageUploadBox}>
            {/* 이미지 미리보기 */}
            {preview ? (
              <div className={styles2.imagePreview}>
                <img
                  src={preview}
                  alt="사업자 등록증 미리보기"
                  className={styles2.previewImage}
                />
              </div>
            ) : (
              <label>사업자 등록증 이미지 첨부 (+)</label>
            )}
            <input
              type="file"
              name="companyCertificationImage"
              id="companyCertificationImage"
              className={styles2.imageInput}
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
        </div>
      </div>

      <div className={styles2.checkContainer}>
        <span className={styles2.checkboxGroup}>
          <input
            type="checkbox"
            name="ageConfirmed"
            onChange={handleCheckboxChange}
          />
          만 14세 이상만 가입할 수 있습니다.<b>*</b>
        </span>
        <span className={styles2.checkboxGroup}>
          <input
            type="checkbox"
            name="termsAccepted"
            onChange={handleCheckboxChange}
          />
          이용약관 및 개인정보 수집에 동의합니다.
          <b>*</b>
        </span>
      </div>

      <button className={styles2.button} onClick={submit}>
        회원가입
      </button>
    </div>
  );
};
export default JoinCompany;
