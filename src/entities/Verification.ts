import {
    BaseEntity,
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from "typeorm";
  import { verificationTarget } from "../types/types";
  
  const PHONE = "PHONE";
  const EMAIL = "EMAIL";
  
  @Entity()
  class Verification extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;

    // enum 은 순차적인 값을 가지는 것에만 사용가능
    @Column({ type: "text", enum: [PHONE, EMAIL] })
    target: verificationTarget;
  
    @Column({ type: "text" })
    payload: string;
  
    @Column({ type: "text" })
    key: string;

    @Column({ type: "boolean", default: false})
    verified: boolean;
  
    @CreateDateColumn() createdAt: string;
  
    @UpdateDateColumn() updatedAt: string;
  
    @BeforeInsert()
    createKey(): void {
      if (this.target === PHONE) {
        this.key = Math.floor(Math.random() * 100000).toString();
      } else if (this.target === EMAIL) {
        // EMAIL 이라면 더 길게 key 만들기
        this.key = Math.random().toString(36).substr(2);
      }
    }
  }
  export default Verification;