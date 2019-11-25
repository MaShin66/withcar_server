import User from '../../../entities/User';
import { EmailSignInMutationArgs, EmailSignInResponse } from '../../../types/graph';
import { Resolvers } from '../../../types/resolvers';
import createJWT from '../../../utils/createJWT';

const resolvers: Resolvers = {
  Mutation: {
    EmailSignIn: async (_, args: EmailSignInMutationArgs): Promise<EmailSignInResponse> => {
      const { email, password } = args;

      try {
        
        const user = await User.findOne({ email });
        if (!user) {
          return {
            ok: false,
            error: "이메일 주소가 올바르지 않습니다",
            token: null
          };
        }

        // user 가 소문자인 이유는 위에서 찾은 user 의 비밀번호와 비교해야하므로
        // comparePassword 는 User 에 있는 함수
        const checkPassword = await user.comparePassword(password);
        if (checkPassword) {
          const token = createJWT(user.id);
          return {
            ok: true,
            error: null,
            token: token
          };
        } else {
          return {
            ok: false,
            error: "비밀번호가 틀렸습니다",
            token: null
          };
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