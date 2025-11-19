import { SwaggerDefinition, Options } from "swagger-jsdoc"

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "MyTohyo REST API",
    version: "1.0.0",
    description: "投票記録システムのREST APIドキュメント",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "ローカル開発環境",
    },
  ],
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          user_id: { type: "integer", description: "ユーザーID" },
          name: { type: "string", description: "氏名（任意）" },
          region: { type: "string", description: "出身地域" },
        },
        required: ["user_id", "region"],
      },
      SocialAccount: {
        type: "object",
        properties: {
          social_account_id: {
            type: "integer",
            description: "ソーシャルアカウントID",
          },
          user_id: { type: "integer", description: "ユーザーID" },
          provider: { type: "string", description: "プロバイダー名" },
          account_identifier: {
            type: "string",
            description: "アカウント識別子",
          },
        },
        required: [
          "social_account_id",
          "user_id",
          "provider",
          "account_identifier",
        ],
      },
      ElectionType: {
        type: "object",
        properties: {
          election_type_id: { type: "integer", description: "選挙種類ID" },
          name: { type: "string", description: "選挙種類名" },
        },
        required: ["election_type_id", "name"],
      },
      Party: {
        type: "object",
        properties: {
          party_id: { type: "integer", description: "政党ID" },
          name: { type: "string", description: "政党名" },
        },
        required: ["party_id", "name"],
      },
      Candidate: {
        type: "object",
        properties: {
          candidate_id: { type: "integer", description: "候補者ID" },
          name: { type: "string", description: "氏名" },
          party_id: {
            type: "integer",
            nullable: true,
            description: "所属政党",
          },
          manifesto_url: { type: "string", description: "マニフェストURL" },
          achievements: { type: "string", description: "実績情報" },
        },
        required: [
          "candidate_id",
          "name",
          "manifesto_url",
          "achievements",
        ],
      },
      Manifesto: {
        type: "object",
        properties: {
          manifesto_id: { type: "integer", description: "マニフェストID" },
          candidate_id: { type: "integer", description: "候補者ID" },
          election_name: { type: "string", description: "選挙名" },
          candidate_name: { type: "string", description: "候補者名" },
          content_format: {
            type: "string",
            enum: ["markdown", "html"],
            description: "マニフェスト本文の形式",
          },
          content: { type: "string", description: "マニフェスト本文" },
          status: {
            type: "string",
            nullable: true,
            enum: ["PROGRESS", "COMPLETE"],
            description: "更新状況ステータス（null: 未更新、PROGRESS: 更新中、COMPLETE: 更新済み）",
          },
        },
        required: [
          "manifesto_id",
          "candidate_id",
          "election_name",
          "candidate_name",
          "content_format",
          "content",
        ],
      },
      Achievement: {
        type: "object",
        properties: {
          achievement_id: { type: "integer", description: "実績ID" },
          election_name: { type: "string", description: "選挙名" },
          candidate_name: { type: "string", description: "候補者名" },
          content_format: {
            type: "string",
            enum: ["markdown", "html"],
            description: "実績本文の形式",
          },
          content: { type: "string", description: "実績本文" },
        },
        required: [
          "achievement_id",
          "election_name",
          "candidate_name",
          "content_format",
          "content",
        ],
      },
      VoteRecord: {
        type: "object",
        properties: {
          vote_id: { type: "integer", description: "投票記録ID" },
          user_id: { type: "integer", description: "ユーザーID" },
          candidate_name: { type: "string", description: "候補者名" },
          candidate_id: { type: "integer", description: "候補者ID" },
          election_name: { type: "string", description: "選挙名" },
          election_type_id: { type: "integer", description: "選挙種類ID" },
          vote_date: { type: "string", format: "date", description: "投票日" },
          photo_url: { type: "string", description: "投票写真URL" },
          party_name: { type: "string", description: "政党名" },
          social_post_url: { type: "string", description: "SNS投稿URL" },
          notes: { type: "string", description: "投票メモ" },
          manifesto: {
            $ref: "#/components/schemas/Manifesto",
            description: "候補者に紐づくマニフェスト情報（存在しない場合はnull）",
          },
          achievement: {
            $ref: "#/components/schemas/Achievement",
            description: "投票記録と紐づく実績・活動情報（存在しない場合はnull）",
          },
        },
        required: [
          "vote_id",
          "user_id",
          "candidate_name",
          "election_name",
          "election_type_id",
          "vote_date",
        ],
      },
    },
  },
}

const options: Options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts"],
}

export default options
