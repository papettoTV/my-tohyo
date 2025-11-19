# ER 図

本システムのエンティティ・リレーション図（ER 図）は以下の通りです。

```mermaid
erDiagram
    USER {
        int user_id PK "ユーザーID"
        string name "氏名（任意）"
        string region "出身地域"
    }
    SOCIAL_ACCOUNT {
        int social_account_id PK "ソーシャルアカウントID"
        int user_id FK "ユーザーID"
        string provider "プロバイダー名（Google, X, Facebook等）"
        string account_identifier "アカウント識別子（サブID等）"
    }
    ELECTION_TYPE {
        int election_type_id PK "選挙種類ID"
        string name "選挙種類名（衆院選挙、参院選挙等）"
    }
    PARTY {
        int party_id PK "政党ID"
        string name "政党名"
    }
    CANDIDATE {
        int candidate_id PK "候補者ID"
        string name "氏名"
        int party_id FK "所属政党"
        string manifesto_url "マニフェストURL"
        string achievements "実績情報"
    }
    MANIFESTO {
        int manifesto_id PK "マニフェストID"
        int candidate_id FK "候補者ID"
        string election_name "選挙名"
        string candidate_name "候補者名"
        string content_format "形式 (markdown/html)"
        text content "マニフェスト本文"
        string status "更新状況 (null/PROGRESS/COMPLETE)"
    }
    ACHIEVEMENT {
        int achievement_id PK "実績ID"
        string election_name "選挙名"
        string candidate_name "候補者名"
        string content_format "形式 (markdown/html)"
        text content "実績本文"
    }
    VOTE_RECORD {
        int vote_id PK "投票記録ID"
        int user_id FK "ユーザーID"
        string candidate_name "候補者名"
        string election_name "選挙名"
        int election_type_id FK "選挙種類ID"
        date vote_date "投票日"
        string party_name "政党名"
        string photo_url "投票写真URL"
        string social_post_url "SNS投稿URL"
        text notes "メモ"
    }

    USER ||--o{ SOCIAL_ACCOUNT : "連携"
    USER ||--o{ VOTE_RECORD : "投票"
    ELECTION_TYPE ||--o{ VOTE_RECORD : "分類"
    CANDIDATE ||--o{ VOTE_RECORD : "参考"
    CANDIDATE ||--o{ MANIFESTO : "公約"
    PARTY ||--o{ CANDIDATE : "所属"
    VOTE_RECORD }o--|| ACHIEVEMENT : "候補者と選挙で参照"
```

## エンティティ説明

- **USER（ユーザー）**

  - ユーザー ID（主キー）、氏名（任意）、出身地域

- **SOCIAL_ACCOUNT（ソーシャルアカウント）**

  - ソーシャルアカウント ID（主キー）、ユーザー ID（外部キー）、プロバイダー名（Google, X, Facebook 等）、アカウント識別子

- **ELECTION_TYPE（選挙種類マスタ）**

  - 選挙種類 ID（主キー）、選挙種類名（衆院選挙、参院選挙、都道府県長選挙、市長選挙等）

- **PARTY（政党）**

  - 政党 ID（主キー）、政党名

- **CANDIDATE（候補者）**

  - 候補者 ID（主キー）、氏名、所属政党（外部キー・任意）、マニフェスト URL、実績情報

- **MANIFESTO（マニフェスト）**

  - マニフェスト ID（主キー）、候補者 ID（外部キー）、選挙名、候補者名、形式（markdown もしくは html）、マニフェスト本文、更新状況ステータス（null=未更新 / PROGRESS=更新中 / COMPLETE=更新済み）。候補者 ID と選挙名の組み合わせで一意

- **ACHIEVEMENT（実績・活動）**

  - 実績 ID（主キー）、選挙名、候補者名、形式（markdown もしくは html）、実績本文。選挙名と候補者名の組み合わせで一意

- **VOTE_RECORD（投票記録）**
  - 投票記録 ID（主キー）、ユーザー ID（外部キー）、候補者名、選挙名、選挙種類 ID（外部キー）、投票日、政党名、投票写真 URL、SNS 投稿 URL、メモ

## リレーション

- ユーザーは複数のソーシャルアカウントを持つ（1 対多）
- ユーザーは複数の投票記録を持つ（1 対多）
- 選挙種類は複数の投票記録を持つ（1 対多）
- 候補者マスタは参考情報として維持し、投票記録は候補者名を直接保持
- 政党は複数の候補者を持つ（1 対多）
- マニフェストは候補者マスタ（CANDIDATE）と紐づき、候補者 ID と選挙名で一意に管理される
- 投票記録は候補者名と選挙名の組み合わせで実績・活動情報に紐づけられる（概念レベルのリレーション）
