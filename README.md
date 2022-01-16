# Version

# How to Use
```bash
docker-compose up -d
docker-compose exec node ash
# lib配下にtsコードを記述
npm run build # lib配下のtsコードをトランスパイル(.js, .d.tsファイルを生成)
```

# Useful Command
```bash
cdk ls # CDK App Stackの一覧取得
cdk synth # CDKテンプレートをCloudFormationに変換した結果を確認
cdk deploy # CDKスタックをデプロイ
cdk diff # 既にデプロイされているCDKスタックとの差分を確認
cdk destroy # デプロイ済のCDKスタックを削除
```

# How to Set Up (only first time)
## 1. Directory
- Dockerfile
- docker-compose.yml
- README.md

## 2. Create CDK Project
```bash
docker-compose exec cdk ash
mkdir cdk
cd cdk
cdk init app --language=typescript
```
