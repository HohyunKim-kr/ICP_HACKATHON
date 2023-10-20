/** @jsxImportSource @emotion/react */
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();
  return (
    <div css={{ paddingLeft: 20 }}>
      <h1>문제가 발생했습니다.</h1>
      <button type="button" onClick={() => navigate("/")}>
        홈으로 돌아가기
      </button>
    </div>
  );
}
