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
      Election: {
        type: "object",
        properties: {
          election_id: { type: "integer", description: "選挙ID" },
          name: { type: "string", description: "選挙名" },
          date: { type: "string", format: "date", description: "選挙日" },
          election_type_id: { type: "integer", description: "選挙種類ID" },
        },
        required: ["election_id", "name", "date", "election_type_id"],
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
          party_id: { type: "integer", description: "所属政党" },
          manifesto_url: { type: "string", description: "マニフェストURL" },
          achievements: { type: "string", description: "実績情報" },
        },
        required: [
          "candidate_id",
          "name",
          "party_id",
          "manifesto_url",
          "achievements",
        ],
      },
      VoteRecord: {
        type: "object",
        properties: {
          vote_id: { type: "integer", description: "投票記録ID" },
          user_id: { type: "integer", description: "ユーザーID" },
          election_id: { type: "integer", description: "選挙ID" },
          candidate_id: { type: "integer", description: "候補者ID" },
          vote_date: { type: "string", format: "date", description: "投票日" },
          photo_url: { type: "string", description: "投票写真URL" },
        },
        required: [
          "vote_id",
          "user_id",
          "election_id",
          "candidate_id",
          "vote_date",
          "photo_url",
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
