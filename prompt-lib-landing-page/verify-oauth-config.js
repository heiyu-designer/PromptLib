// 验证OAuth配置
console.log('=== OAuth Configuration Verification ===');

// 从截图看到的正确信息
const correctClientId = 'Iv1.58f2c9b45a91c3e9d';
const correctCallbackUrl = 'https://upoplrsvarlwhkqknbnq.supabase.co/auth/v1/callback';

// 从URL中提取的错误信息
const wrongClientId = 'a5865e3e-8fc3-4f1f-be78-5b34f0646f2b';

console.log('正确的GitHub Client ID:', correctClientId);
console.log('错误的GitHub Client ID:', wrongClientId);
console.log('正确的回调URL:', correctCallbackUrl);

// 生成正确的GitHub OAuth URL示例
const state = 'example-state';
const scope = 'user:email';
const correctOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${correctClientId}&redirect_uri=${encodeURIComponent(correctCallbackUrl)}&scope=${scope}&state=${state}`;

console.log('\n正确的GitHub OAuth URL应该是:');
console.log(correctOAuthUrl);

console.log('\n请检查Supabase Dashboard中的GitHub Provider配置是否使用了正确的Client ID: ' + correctClientId);