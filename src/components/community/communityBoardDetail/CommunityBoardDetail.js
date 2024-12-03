import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CommunityBoardDetail.module.css';
import { useNavigate, useParams } from 'react-router';
import { FaUserCircle } from 'react-icons/fa';
import { url } from 'lib/axios';

const CommunityBoardDetail = () => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();
  const { CommunityNum } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false); // 북마크 상태

  useEffect(() => {
    if (!CommunityNum) {
      console.error('해당 페이지를 찾을 수 없습니다.');
      return;
    }

    const fetchPostData = async () => {
      try {
        const postResponse = await axios.get(
          `${url}/communityDetail/${CommunityNum}`
        );
        setPost(postResponse.data);

        const commentsResponse = await axios.get(
          `${url}/communityComment/${CommunityNum}`
        );
        setComments(commentsResponse.data);

        // 북마크 상태 가져오기
        const bookmarkResponse = await axios.get(`${url}/communityBookmark`, {
          params: {
            userId: '1f95ebff-7367-4386-b04b-bd8b57697dc1', // 사용자 ID
            communityNum: CommunityNum, // 커뮤니티 번호
          },
        });
        setIsBookmarked(bookmarkResponse.data.isBookmarked); // 북마크 상태 설정
      } catch (error) {
        console.error('데이터를 가져오는 중 오류 발생:', error);
      }
    };

    fetchPostData();

    axios
      .post(`http://localhost:8080/increaseViewCount/${CommunityNum}`)
      .catch((error) => {
        console.error('조회수 증가 중 오류 발생:', error);
      });
  }, [CommunityNum]);

  const handleBackButton = () => {
    navigate('/CommunityMain');
  };

  const handleWriteButton = () => {
    navigate('/CommunityBoardWrite');
  };

  const handleBookmarkClick = async () => {
    try {
      const response = await axios.post(`http://localhost:8080/test7`, null, {
        params: {
          userId: '1f95ebff-7367-4386-b04b-bd8b57697dc1',
          communityNum: CommunityNum,
        },
      });

      if (response.status === 200) {
        console.log('북마크 상태 변경 성공:', response.data);
        setIsBookmarked(!isBookmarked); // 상태 토글
      } else {
        console.error('북마크 상태 변경 실패:', response.data);
      }
    } catch (error) {
      console.error('북마크 상태 변경 중 오류 발생:', error);
      alert('북마크 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim()) {
      try {
        const newCommentData = {
          communityId: CommunityNum,
          userId: '1f95ebff-7367-4386-b04b-bd8b57697dc1', // 사용자 아이디로 수정해야함
          content: newComment,
        };

        const response = await axios.post(
          `${url}/communityCommentWrite`,
          null,
          {
            params: newCommentData,
          }
        );

        if (response.status === 201) {
          setComments([
            ...comments,
            {
              id: comments.length + 1,
              userName: '작성한 댓글',
              content: newComment,
              createdAt: new Date().toISOString().slice(0, 10),
            },
          ]);
          setNewComment(''); // 입력 필드 초기화
        } else {
          console.error('댓글 작성 실패:', response.data);
        }
      } catch (error) {
        console.error('댓글 작성 중 에러 발생:', error);
      }
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* 상단 이미지 */}
      <div className={styles.postImageContainer}>
        <img
          src={`${url}/communityImage/${post.coverImage}`}
          alt="상세 이미지"
          className={styles.postImage}
        />
      </div>

      <div className={styles.postDetailContainer}>
        {/* 게시글 헤더 */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>{post.title}</div>
        </div>

        {/* 유저 정보 섹션 */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <FaUserCircle color="#6D885D" size={30} />
            <span className={styles.username}>{post.username}</span>
            <span className={styles.commentDate}>{post.date}</span>
          </div>
          <div className={styles.actions}>
            {/* {post.owner ? (
          <button className={styles.editButton} onClick={handleWriteButton}>
            수정하기
          </button>
        ) : isBookmarked ? (
          <button
            className={styles.bookmarkedButton} // 활성화된 북마크 스타일
            onClick={handleBookmarkClick}
          >
            북마크 해제
          </button>
        ) : (
          <button
            className={styles.bookmarkButton} // 기본 북마크 스타일
            onClick={handleBookmarkClick}
          >
            북마크
          </button>
        )} */}
            <button className={styles.editButton} onClick={handleWriteButton}>
              수정하기
            </button>
            {isBookmarked ? (
              <button
                className={styles.bookmarkedButton}
                onClick={handleBookmarkClick}
              >
                북마크 해제
              </button>
            ) : (
              <button
                className={styles.bookmarkButton}
                onClick={handleBookmarkClick}
              >
                북마크
              </button>
            )}
          </div>
        </div>

        {/* 게시글 상세 정보 카드 */}
        <div className={styles.detailsCard}>
          <div className={styles.detailsIcons}>
            <div className={styles.iconItem}>🏠 {post.type}</div>
            <div className={styles.iconItem}>📐 {post.size}</div>
            <div className={styles.iconItem}>✏️ {post.style}</div>
            <div className={styles.iconItem}>👫 {post.familyType}</div>
          </div>
          <hr className={styles.line} />
          <div className={styles.detailContent}>
            지역: {post.address1} {post.address2} &nbsp;&nbsp;|&nbsp;&nbsp;
            스타일: {post.style} &nbsp;&nbsp;|&nbsp;&nbsp; 예산: {post.money}
            &nbsp;&nbsp; |&nbsp;&nbsp; 기간: {post.periodStartDate} ~{' '}
            {post.periodEndDate}
          </div>
        </div>

        {/* 게시글 내용 */}
        <div className={styles.postContent}>
          <p>{post.content}</p>
        </div>

        {/* 댓글 섹션 */}
        <div className={styles.commentsSection}>
          <div className={styles.comment}>댓글</div>
          <div className={styles.commentInput}>
            <button
              onClick={handleCommentSubmit}
              className={styles.submitButton}
            >
              작성하기
            </button>
            <textarea
              value={newComment}
              onChange={handleCommentChange}
              placeholder="댓글을 작성해주세요"
              maxLength={500}
              className={styles.textArea}
            />
          </div>
          <div className={styles.commentOutput}>
            <div className={styles.commentsList}>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className={styles.commentItem}>
                    <div
                      className={styles.commentHeader}
                      style={{ marginBottom: '10px' }}
                    >
                      <FaUserCircle color="#6D885D" size={30} />
                      <span className={styles.commentUsername}>
                        {comment.userName}
                      </span>
                      <span className={styles.commentDate}>
                        {comment.createdAt}
                      </span>
                    </div>
                    <p className={styles.commentContent}>{comment.content}</p>
                  </div>
                ))
              ) : (
                <p style={{ marginTop: '50px' }}>댓글이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityBoardDetail;
