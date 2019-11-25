import Ride from '../../../entities/Ride';
import User from '../../../entities/User';
import { RequestRideMutationArgs, RequestRideResponse } from '../../../types/graph';
import { Resolvers } from '../../../types/resolvers';
import privateResolver from '../../../utils/privateResolver';

const resolvers: Resolvers = {
  Mutation: {
    RequestRide: privateResolver(
      async (_, args: RequestRideMutationArgs, { req, pubSub }): Promise<RequestRideResponse> => {
        const user: User = req.user;
        // if (!user.isRiding && !user.isDriving) { 원래 이거인데 운행 끝나고 isRiding 이 false 로 안바껴서 어쩔 수 없이..
        if (!user.isDriving) {
          try {
            const ride = await Ride.create({ ...args, passenger: user }).save();
            pubSub.publish("rideRequest", { NearbyRideSubscription: ride });
            user.isRiding = true;
            user.save();
            return {
              ok: true,
              error: null,
              ride
            };
          } catch (error) {
            return {
              ok: false,
              error: error.message,
              ride: null
            };
          }
        } else {
          return {
            ok: false,
            error: "이미 탑승중인 이용자이거나 드라이버는 경로를 요청할 수 없습니다",
            ride: null
          };
        }
      }
    )
  }
};

export default resolvers;