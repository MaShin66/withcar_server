import jwt from 'jsonwebtoken';
import User from '../entities/User';

const decodeJWT = async (token: string): Promise<User | undefined> => {
  try { // decodeJWT 함수는 토큰을 확인해서 토큰에 있는 id 와 실제 유저 id 와 비교 -> 있으면 user 리턴
    // 없으면 undefined 하기 때문에 Promise<User | undefined>
    const decoded: any = jwt.verify(token, process.env.JWT_TOKEN || "");
    const { id } = decoded;
    const user = await User.findOne({ id });
    return user;
  } catch (error) {
    return undefined;
  }
};

export default decodeJWT;