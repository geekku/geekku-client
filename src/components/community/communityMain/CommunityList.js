// CommunityList.jsx
import React, { useEffect, useRef } from 'react';
import CommunityListCard from './CommunityListCard';
import styles from './CommunityList.module.css';

const CommunityList = ({
  communityList,
  setCommunityList,
  setPage,
  hasMore,
  isLoading,
}) => {
  const loaderRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      {
        threshold: 1.0,
      }
    );
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore, isLoading, setPage]);

  return (
    <div className={styles.postList}>
      {communityList.length === 0 ? (
        <>
          <div></div>
          <div className={styles.emptyMessage}>커뮤니티가 없습니다.</div>
          <div></div>
        </>
      ) : (
        communityList.map((post, index) => (
          <CommunityListCard
            key={index}
            communityNum={post.communityNum}
            title={post.title}
            image={post.coverImage}
            viewCount={post.viewCount}
            profile={post.nickname ? post.nickname : post.name}
            className={styles.postCard}
          />
        ))
      )}
      {/* 로딩 감지용 로더 */}
      <div ref={loaderRef} style={{ height: '50px' }} />
    </div>
  );
};

export default CommunityList;
