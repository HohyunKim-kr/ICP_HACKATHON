/** @jsxImportSource @emotion/react */
import { useNavigate } from "react-router-dom";

export default function NotFoundErrorPage() {
  const navigate = useNavigate();
  return (
    <div css={{ paddingLeft: 20 }}>
      <h1>404 Not Found</h1>
      <button type="button" onClick={() => navigate("/")}>
        홈으로 돌아가기
      </button>
    </div>
  );
}
