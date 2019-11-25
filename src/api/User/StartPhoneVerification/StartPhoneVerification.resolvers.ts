import { Resolvers } from 'src/types/resolvers';
import Verification from '../../../entities/Verification';
import { StartPhoneVerificationMutationArgs, StartPhoneVerificationResponse } from '../../../types/graph';
import { sendVerificationSMS } from '../../../utils/sendSMS';

const resolvers: Resolvers = {
    Mutation: {
        StartPhoneVerification: async (_, args: StartPhoneVerificationMutationArgs): Promise<StartPhoneVerificationResponse> => {

            const { phoneNumber } = args;
            try {

                const existingVerification = await Verification.findOne({ payload: phoneNumber });
                // 이미 인증이 존재한다면 새로 받아야 하므로 삭제
                if(existingVerification) {
                    existingVerification.remove();
                }
                // 인증이 처음이라면 번호 인증 ㄱ
                const newVerification = await Verification.create({
                    payload: phoneNumber,
                    target: "PHONE"
                }).save();
                // Verification 에 새로운 열을 만들어줄 건데 그 이름이 newVerification 이고
                // 속성 중 하나인 key 값은 Verification.ts 에 적혀있음
                // SMS 를 보내는데 필요한 게 번호와 key 이므로
                await sendVerificationSMS(newVerification.payload, newVerification.key);
                return {
                    ok: true,
                    error: null
                }
            } catch (error) {
                return {
                    ok: false,
                    error: error.message
                }
            }
            
        }
    }
}

export default resolvers;