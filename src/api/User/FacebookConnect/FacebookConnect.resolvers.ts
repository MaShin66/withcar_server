import { FacebookConnectMutationArgs, FacebookConnectResponse } from 'src/types/graph';
import { Resolvers } from 'src/types/resolvers';
import User from '../../../entities/User';
import createJWT from '../../../utils/createJWT';


const resolvers: Resolvers = {
    Mutation: {
        // 이 mutation 의 이름은 FacebookConnect 이고 args 의 타입은 FacebookConnectMutationArgs 인데
        // typescript 는 항상 type 을 체크해야하므로 graph.d.ts 에 자동으로 만들어지게 해둔 것
        // 그리고 이 함수의 반환값은 FacebookConnectResponse (ok, error, token을 반환하는) 으로 약속한다
        FacebookConnect: async (_, args: FacebookConnectMutationArgs): Promise<FacebookConnectResponse> => {
            
            const { fbId } = args;

            try {
                // 이미 존재하는 User 가 있는지를 User 에서 찾아보고
                const existingUser = await User.findOne({ fbId });
                if(existingUser) {
                    // 이미 있다면 그 User 의 id를 가지고 웹토큰 발행
                    const token = createJWT(existingUser.id)
                    return {
                        ok: true,
                        error: null,
                        token: token
                    };
                }
            } catch (error) { // 위에서 찾는 게 오류 날 수 있으니까
                return {
                    ok: false,
                    error: error.message,
                    token: null
                };
            }

            try {
                // 기존의 User 가 아니라면 User 를 생성할 건데 위에서 찾은
                // args(firstName: string, lastName, email, fbId) 가 입력되고 (다 묶어서 ...args 로 표현)
                // profilePhoto 는 fbid 에 따른 주소로 가서 가져온다.
                const newUser = await User.create({ ...args, profilePhoto: `http://graph.facebook.com/${fbId}/picture?type=square` }).save();
                const token = createJWT(newUser.id)
                return {
                    ok: true,
                    error: null,
                    token: token
                };
            } catch (error) {
                return {
                    ok: false,
                    error: error.message,
                    token: null
                }
            }
            
        }
    }
};

export default resolvers;