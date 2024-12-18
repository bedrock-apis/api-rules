- [X] **Project Initialization** *(Stage 1)*
  - [X] **Custom Rule Initialization**: Set up initial project structure and ESLint configuration.
  - [X] **Type Based Custom Rule**: Develop a custom rule that leverages TypeScript type information.
  - [X] **API Method Call Rule**: Create rules to validate API method calls based on context.

- [ ] **Privileges Logic** *(Stage 2)*
  - [X] **Type Script Migration**: Use TypeScript for development of our ESLint Plugin.
  - [X] **Use Rolldown Bundler**: Bundler Our Plugin as single file.
  - [X] **Well Commented Code**: Conmaster have to comment the code better.
  - [X] **Caching Method Calls**: Implement a mechanism to cache method calls and resolve them after their declarations are processed.
  - [ ] **Load Privileges for API Modules**: Develop logic to load and manage privileges for various API modules.
  - [X] **Testing `test` Method Without Privileges**: Ensure that calls to the `test` method fail as hardcoded privileges are `none`.
  - [X] **Testing `test` Method in Privileged Contexts**: Validate that the `test` method works correctly within privileged contexts.

- [ ] **Release Alpha Version** *(Stage 3)*
  - [X] **Implement `test` Logic for Native APIs**: Develop the `test` logic, for API functions calls.
  - [X] **Add More Specific Tests**: Add basic tests for cases where it should error and where not
  - [ ] **Move To TS AST**: When we migrate to TS AST Nodes then we don't have to rely on ESLint execution timing.
  - [ ] **Release Alpha Version With Hardcoded Metadata**

- [ ] **Release Beta Version** *(Stage 4)*
  - [X] **Implement Async Execution Handling**: Add support for async commands using `await null;` expressions to enforce asynchronous execution.
  - [ ] **Implement Checks for Generator Methods**: Develop checks for generator function instances to ensure they adhere to context privileges.
  - [ ] **Internal Testing**: Conduct initial testing of the new rules internally to identify any immediate issues.
  - [ ] **Setup Guide**: Create preliminary setup guide for the beta version to help testers understand the new features.
 - [ ] **Community Engagement**: Engage with the community to gather feedback and suggestions for further improvements.

 
- [ ] **Release Stable Version** *(Stage 5)*
  - [ ] **User Feedback**: Collect detailed feedback from beta users to understand their experience and any problems they encountered.
  - [ ] **Bug Fixes & Improvements**: Address any identified bugs and make necessary improvements based on feedback.
  - [ ] **Performance Optimization**: Ensure the rules perform efficiently without significantly affecting build times.
  - [ ] **Final Testing and Documentation**: Perform final testing and create comprehensive documentation for the stable release.
  - [ ] **Create Release Notes**: Document all the changes, new features, and bug fixes included in the stable release.
  - [ ] **Community Promotion**: Promote the stable release through social media, blogs, and relevant forums.
