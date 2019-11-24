import Chat from "../../../entities/Chat";
import Ride from "../../../entities/Ride";
import User from "../../../entities/User";
import {
  UpdateRideStatusMutationArgs,
  UpdateRideStatusResponse
} from "../../../types/graph";
import { Resolvers } from "../../../types/resolvers";
import privateResolver from "../../../utils/privateResolver";

const resolvers: Resolvers = {
  Mutation: {
    UpdateRideStatus: privateResolver(async (_, args: UpdateRideStatusMutationArgs, { req, pubSub }): Promise<UpdateRideStatusResponse> => {
        const user: User = req.user;
        if (user.isDriving) {
          try {
            let ride: Ride | undefined;
            // status 가 ACCEPTED 라면
            if (args.status === "ACCEPTED") {
              // id 와 rideId 이며 status 가 REQUESTING 인 걸 찾는다.
              ride = await Ride.findOne(
                {
                  id: args.rideId,
                  status: "REQUESTING"
                },
                { relations: ["passenger", "driver"] }
              );
              // ride 가 있다면 ride 의 driver 를 user 로 설정
              if (ride) {
                ride.driver = user;
                user.isTaken = true;
                await user.save();
                const chat = await Chat.create({
                  driver: user,
                  passenger: ride.passenger
                }).save();
                ride.chat = chat;
                await ride.save();
              }
            } 
            // 운행 끝나고 isRiding 바꾸기 위해 새로 추가한 부분..
            // else if (args.status ===  "FINISHED") {
            //   ride = await Ride.findOne(
            //     {
            //       id: args.rideId,
            //       status: "REQUESTING"
            //     },
            //     { relations: ["passenger", "driver"] }
            //   );
            //   if(ride) {
            //     ride.driver = user;
            //     user.isTaken = false;
            //     await user.save();
            //     const passenger: User = ride.passenger;
            //     passenger.isRiding = false;
            //     await passenger.save();
            //   }
            // } 
            // 운행 끝나고 isRiding 바꾸기 위해 새로 추가한 부분..
            else {
              ride = await Ride.findOne({
                id: args.rideId,
                driver: user
              }, {relations: ["passenger", "driver"]});
            }
            if (ride) {
              ride.status = args.status;
              ride.save();
              pubSub.publish("rideUpdate", { RideStatusSubscription: ride });
              return {
                ok: true,
                error: null,
                rideId: ride.id
              };
            } else {
              return {
                ok: false,
                error: "Cant update ride",
                rideId: null
              };
            }
          } catch (error) {
            return {
              ok: false,
              error: error.message,
              rideId: null
            };
          }
        } else {
          return {
            ok: false,
            error: "You are not driving",
            rideId: null
          };
        }
      }
    )
  }
};
export default resolvers;