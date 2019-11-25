import User from '../../../entities/User';
import Verification from '../../../entities/Verification';
import { RequestEmailVerificationResponse } from '../../../types/graph';
import { Resolvers } from '../../../types/resolvers';
import privateResolver from '../../../utils/privateResolver';
import { sendVerificationEmail } from '../../../utils/sendEmail';

const resolvers: Resolvers = {
  Mutation: {
    RequestEmailVerification: privateResolver(async (_, __, { req }): Promise<RequestEmailVerificationResponse> => {

        const user: User = req.user;
        if (user.email && !user.verifiedEmail) { // user email이 있고 기존에 인증된 메일이 없어야 함
          try {
            const oldVerification = await Verification.findOne({
              payload: user.email
            });
            if (oldVerification) { // Verification 테이블에서 그전에 같은 email 을 찾으면 삭제
              oldVerification.remove();
            }
            const newVerification = await Verification.create({ // 그게 아니라면 새로운 열 생성
              payload: user.email,
              target: "EMAIL"
            }).save();
            await sendVerificationEmail(user.fullName, newVerification.key); // 인증번호 보내기
            return {
              ok: true,
              error: null
            };
          } catch (error) {
            return {
              ok: false,
              error: error.message
            };
          }
        } else {
          return {
            ok: false,
            error: "등록된 이메일이 없거나 이미 인증된 이메일입니다"
          };
        }
      }
    )
  }
};

export default resolvers;