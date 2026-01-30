# Page snapshot

```yaml
- generic [ref=e4]:
  - heading "Create Account" [level=2] [ref=e5]
  - generic [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]: Username
      - textbox "johndoe" [ref=e9]
    - generic [ref=e10]:
      - generic [ref=e11]: Email
      - textbox "john@example.com" [ref=e12]
    - generic [ref=e13]:
      - generic [ref=e14]: Password
      - textbox "••••••••" [ref=e15]
    - button "Register" [ref=e16] [cursor=pointer]
  - generic [ref=e17]:
    - text: Already have an account?
    - link "Login" [ref=e18] [cursor=pointer]:
      - /url: /login
```