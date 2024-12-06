import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CommunityBoardDetail.module.css';
import { useNavigate, useParams } from 'react-router';
import { FaUserCircle } from 'react-icons/fa';
import { axiosInToken, url } from 'lib/axios';
import { tokenAtom, userAtom } from 'store/atoms';
import { useAtomValue } from 'jotai';

const CommunityBoardDetail = () => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();
  const { CommunityNum } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false); // 북마크 상태
  const [isOwner, setIsOwner] = useState(false); // 게시글 소유 여부 상태 추가
  const user = useAtomValue(userAtom); // 현재 로그인된 사용자 정보
  const { id } = useParams();
  const token = useAtomValue(tokenAtom);

  useEffect(() => {
    if (!CommunityNum) {
      console.error('해당 페이지를 찾을 수 없습니다.');
      return;
    }

    const fetchPostData = () => {
      console.log(user);
      axios
        .post(`${url}/communityDetail/${CommunityNum}`, {
          userId: user?.userId || '1f95ebff-7367-4386-b04b-bd8b57697dc0',
        })
        .then((res) => {
          setPost(res.data.communityDetail); //상세
          setComments([...res.data.commentList]); //댓글

          if (user?.userId || user?.companyId) {
            setIsBookmarked(res.data.bookmark); //북마크(로그인 시에만)
            setIsOwner(user.userId === res.data.communityDetail.userId);
          } else {
            console.error('현재 로그인된 사용자가 없습니다.');
            setIsOwner(false); // 로그인이 안 되어 있다면 소유자 아님으로 처리
          }
        })
        .catch((err) => {
          console.log(err);
        });
    };

    fetchPostData();
  }, [CommunityNum]);

  const handleBackButton = () => {
    navigate('/CommunityMain');
  };

  const handleWriteButton = () => {
    navigate('/CommunityBoardWrite');
  };
  const handleEditButtonClick = () => {
    navigate(`/communityBoardEdit/${CommunityNum}`);
  };

  const handleBookmarkClick = async () => {
    if (!user?.userId && !user?.companyId) {
      console.log(user.companyId);
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    try {
      const response = await axiosInToken(token).post(
        `${url}/user/communityBookmark?communityNum=${CommunityNum}`,
        {
          userId: user.userId,
        }
      );
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
    if (!user?.userId && !user?.companyId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (newComment.trim()) {
      try {
        const newCommentData = {
          communityId: CommunityNum,
          userId: user.userId,
          content: newComment,
        };

        const response = await axiosInToken(token).post(
          `${url}/user/communityCommentWrite`,
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
          setNewComment('');
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
            {isOwner ? (
              <button
                className={styles.editButton}
                onClick={handleEditButtonClick}
              >
                수정하기
              </button>
            ) : isBookmarked ? (
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
