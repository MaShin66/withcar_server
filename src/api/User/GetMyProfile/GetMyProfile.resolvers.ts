import { Resolvers } from '../../../types/resolvers';
import privateResolver from '../../../utils/privateResolver';

const resolvers: Resolvers = {
  Query: { // privateResolver 함수를 먼저 성공하면 그 다음 진행 ()
    GetMyProfile: privateResolver(async (_, __, { req }) => {
      const { user } = req;
      return {
        ok: true,
        error: null,
        user
      };
    })
  }
};

export default resolvers;