import User from '../../../entities/User';
import Verification from '../../../entities/Verification';
import { EmailSignUpMutationArgs, EmailSignUpResponse } from '../../../types/graph';
import { Resolvers } from '../../../types/resolvers';
import createJWT from '../../../utils/createJWT';
import { sendVerificationEmail } from '../../../utils/sendEmail';

const resolvers: Resolvers = {
  Mutation: {
    EmailSignUp: async (_, args: EmailSignUpMutationArgs): Promise<EmailSignUpResponse> => {

      const { email } = args;
      try {
        // 이미 가입된 회원이라면 회원가입 할 필요가 없고 로그인 해야함
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return {
            ok: false,
            error: "이미 가입된 회원입니다",
            token: null
          };
        } else { // 새로운 유저라면 폰 번호 인증 했는지 체크 (아래 if랑 이어짐)
          const phoneVerification = await Verification.findOne({
            payload: args.phoneNumber,
            verified: true
          });

          // 폰 인증이 됐다면 폰 인증만 된거니까 다음 인증인 이메일 인증을 통해 회원가입 진행
          if (phoneVerification) {
            const newUser = await User.create({ ...args }).save();
            if (newUser.email) {
              const emailVerification = await Verification.create({
                payload: newUser.email,
                target: "EMAIL"
              }).save();
              await sendVerificationEmail(
                newUser.fullName,
                emailVerification.key
              );
            }
            const token = createJWT(newUser.id);
            return {
              ok: true,
              error: null,
              token: token
            };
          } else { // 폰 인증이 안됐다면 하라고 에러 전달
            return {
              ok: false,
              error: "휴대폰 번호 인증을 먼저 해야 합니다",
              token: null
            };
          }
        }
      } catch (error) {
        return {
          ok: false,
          error: error.message,
          token: null
        };
      }
      
    }
  }
};

export default resolvers;