import styles from './EstateSearch.module.scss';
import { useEffect, useState } from 'react';
import EstateList from '../estateList/EstateList';
import KakaoMap from 'components/map/KakaoMap';
import axios from 'axios';
import { url } from 'utils/axios';
import { useLocation } from 'react-router';
import { CiLocationOn } from 'react-icons/ci';
import { searchByKeyword } from 'utils/utils';
import useDebounce from 'hook/useDebounce';

const EstateSearch = () => {
  const location = useLocation();
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [type, setType] = useState('');
  const [estateList, setEstateList] = useState([]);
  const searchResults = searchByKeyword(searchInput);
  const debouncedKeyword = useDebounce(keyword, 1000); //200ms로 설정된 debounce

  // 초기 location.state에서 keyword 값 설정
  useEffect(() => {
    if (location.state.keyword) {
      const initialKeyword = location.state.keyword;
      setKeyword(processKeyword(initialKeyword));
      setSearchInput(initialKeyword);
    }
  }, [location.state]);

  useEffect(() => {
    if (debouncedKeyword || type) {
      fetchData(debouncedKeyword, type);
    }
  }, [debouncedKeyword, type]);

  // 검색어 전처리 함수
  const processKeyword = (keyword) => {
    const replacements = {
      광역시: '',
      충청북도: '충북',
      충청남도: '충남',
      전라북도: '전북',
      전라남도: '전남',
      경상북도: '경북',
      경상남도: '경남',
    };

    let processedKeyword = keyword || '';
    Object.keys(replacements).forEach((key) => {
      processedKeyword = processedKeyword.replace(key, replacements[key]);
    });

    return processedKeyword.trim();
  };

  const fetchData = (searchKeyword = keyword, searchType = type) => {
    const params = {};
    if (searchType) params.type = searchType;
    if (searchKeyword) params.keyword = processKeyword(searchKeyword);

    axios
      .get(`${url}/estateList`, { params })
      .then((res) => {
        console.log(res.data);
        setEstateList([...res.data.estateList]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 타입 선택
  const handleType = (type) => {
    setType(type);
  };

  // 키워드 입력
  const handleKeywordChange = (e) => {
    setSearchInput(e.target.value);
  };

  // 검색 리스트 항목 클릭
  const handleKeywordClick = (selectedKeyword) => {
    setKeyword(selectedKeyword);
    setSearchInput(selectedKeyword);
    setType('');
    fetchData(selectedKeyword);
  };

  return (
    <div className={styles.container}>
      <div className={styles.topWrapper}>
        <ul className={styles.typeSelect}>
          <li
            className={type === 'farmHouse' ? styles.selected : undefined}
            onClick={() => handleType('farmHouse')}
          >
            시골농가주택
          </li>
          <li
            className={type === 'countryHouse' ? styles.selected : undefined}
            onClick={() => handleType('countryHouse')}
          >
            전원주택
          </li>
          <li
            className={type === 'apt' ? styles.selected : undefined}
            onClick={() => handleType('apt')}
          >
            아파트/빌라
          </li>
          <li
            className={type === 'land' ? styles.selected : undefined}
            onClick={() => handleType('land')}
          >
            농장/토지
          </li>
        </ul>
        <div className={styles.searchWrapper}>
          <input
            type="test"
            placeholder="매물을 검색해주세요."
            value={searchInput}
            onChange={handleKeywordChange}
          />
          <button>검색</button>
          {keyword !== '' && searchResults.length !== 0 && (
            <ul className={styles.searchList}>
              {searchResults.map((search, i) => (
                <li key={i} onClick={() => handleKeywordClick(search)}>
                  <CiLocationOn size="20" />
                  <p>{search}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.bodyWrapper}>
        {estateList.length === 0 ? (
          <div className={styles.noEstate}>등록된 매물 목록이 없습니다.</div>
        ) : (
          <EstateList estateList={estateList} />
        )}
        <KakaoMap />
      </div>
    </div>
  );
};

export default EstateSearch;
