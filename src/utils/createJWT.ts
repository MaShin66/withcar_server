import jwt from 'jsonwebtoken';

// createJWT 라는 이름으로 만들었고 id 값을 입력 받아서 token 을 반환한다
// sign 이라는 함수를 통해서 id와 미리 저장된 토큰을 받아 새로운 토큰 리턴?
const createJWT = (id: number): string => {
  const token = jwt.sign(
    { id: id },
    process.env.JWT_TOKEN || ""
  );
  return token;
};

export default createJWT;