import User from '../../../entities/User';
import { ToggleDrivingModeResponse } from '../../../types/graph';
import { Resolvers } from '../../../types/resolvers';
import privateResolver from '../../../utils/privateResolver';

const resolvers: Resolvers = {
  Mutation: {
    ToggleDrivingMode: privateResolver(async (_, __, { req }): Promise<ToggleDrivingModeResponse> => {
        const user: User = req.user; // 요청한 user 와 같은 user 가 있다면
        user.isDriving = !user.isDriving; // isDriving 의 값을 반대로 적용
        user.save();
        return {
          ok: true,
          error: null
        };
      }
    )
  }
};

export default resolvers;