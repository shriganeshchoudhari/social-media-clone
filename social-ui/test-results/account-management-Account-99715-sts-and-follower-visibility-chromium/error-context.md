# Page snapshot

```yaml
- generic [ref=e4]:
  - heading "Create Account" [level=2] [ref=e5]
  - generic [ref=e6]: Registration failed. Try a different username/email.
  - generic [ref=e7]:
    - generic [ref=e8]:
      - generic [ref=e9]: Username
      - textbox "johndoe" [ref=e10]: priv_8610673
    - generic [ref=e11]:
      - generic [ref=e12]: Email
      - textbox "john@example.com" [ref=e13]: priv_8610673@examplenet.com
    - generic [ref=e14]:
      - generic [ref=e15]: Password
      - textbox "••••••••" [ref=e16]: Password123!
    - button "Register" [ref=e17] [cursor=pointer]
  - generic [ref=e18]:
    - text: Already have an account?
    - link "Login" [ref=e19] [cursor=pointer]:
      - /url: /login
```