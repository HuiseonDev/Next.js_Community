import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import github from "next-auth/providers/github";
import google from "next-auth/providers/google";

//로그인 인증 ( 회원 여부 식별)
// 로그인 인가 (이 유저가 회원의 어떤 소속인가? 어떤 권한을 가졌는가 )
//OAuth2.0 공부하기
const SERVER = process.env.NEXT_PUBLIC_API_SERVER;
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      //email/password 로그인
      async authorize(credentials) {
        //사용자가 입력한 정보 (credentials에 담겨있음)
        //사용자가 입력한 정보를 이용해서 로그인 처리
        const res = await fetch(`${SERVER}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });
        const resJson = await res.json();
        if (resJson.ok) {
          const user = resJson.item;
          return {
            id: user._id,
            name: user.name,
            email: user.email,
            type: user.type,
            image: user.profileImage && SERVER + user.profileImage,
            accessToken: user.token.accessToken,
            refreshToken: user.token.refreshToken,
          };
        } else {
          return null;
        }
      },
    }),
    github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    //로그인 상태 유지
    strategy: "jwt", //default => 'jwt'
    maxAge: 60 * 60 * 24,
  },
  pages: {
    signIn: "/login", //default => '/auth/signin'
  },
  callbacks: {
    //로그인 처리를 계속 할지 여부 결정
    //true를 리턴하면 로그인 처리를 계속하고 false를 리턴하거나 Error를 throw하면 로그인 흐름을 중단한다
    //false return -> jwt({ token, user }), session() 실행안됨!
    //user: authorize()가 리턴한 값
    async signIn({ user }) {
      //user에 들어있는 사용자 정보를 이용해서 우리쪽 DB에 저장(회원가입)
      //가입된 회원일 경우 자동으로 로그인 처리

      return true;
    },

    //로그인 성공한 회원 정보로 token 객체 설정
    //최초 로그인시 user객체 전달, 업데이트 처리를 한다면 user전달은 안됨!
    async jwt({ token, user }) {
      //토근 만료 체크, 만료되었으면 refreshToken으로 accessToken 갱신 ( refreshToken은 기간이 길되 accessToken은 비교적 짧다)
      //refreshToken도 만료되었을 경우 로그아웃 처리
      if (user?.accessToken) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },

    //클라이언트에서 세션 정보 요청시 호출
    //token 객체 정보로 session 객체 설정
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
  },
});
//최초 로그인시 authorize부터 하나씩 타고 내려오면서 실행됨
// 다시 로그인하면 jwt, session 호출
// 사용자가 토큰 조회하려면 session

//로그인 하고싶으면 오솔라이즈에서 검증
//로그인 값이 있다면 성공이나 취소 결정하는 user 정보와 소셜로그인 분야 넘겨줌
//jwt => token이 있다면 전달받아서 사용자 토큰으로 만료 여부와 재발급 로직을 활용해줌
//session => 기존 토큰정보를 넘겨주면 유저 정보와 로그인 유무를 확인해줌
