# 
## Update Plan

1. First Ran NPM update - This didn't resolve a lot, because the version numbers
   had proceeded beyond the major version # (e.g. "^1.3.2" updates to "1.9.x", but not 3.x.x
   
2. Examine npm audit/install output.
    Bothe npm audit and install list vulnerabilities, and you can see which dependency
    is invoking the problematic versions 

3. While updates are needed     
  a. Select a package to update 
  b. Find the npm page for the package
    Google "npm <packagename>" and find the page 
    for example [npmjs.com/package/resolve-url-oader](https://www.npmjs.com/package/resolve-url-loader)
    
    Note the latest version, put that in the package-lock with^
    remove the remainder of the entrei "resolved, ..."
    run "npm install"

  c. Search for "package-name" in package-lock.json
    You will find old 

## Update Experience 
1. Try the whole thing
    ```npm audit --fix --force```
    Test and see 
    Ran repeatedly, and did not reach a state where it had no vulderabilities. 
    
    **After 1st Time:**
    react-scripts is at "^5.0.1" (at least 5.0.1)
    8 vulnerabilities (2 moderate, 6 high)
    
    **After 2nd Time:**
    Change react-scripts to 3.0.1 (DOWNGRADE?)
    131 vulnerabilities (1 low, 104 moderate, 22 high, 4 critical)
    
    **After 3rd Time:**
    react-scripts is back to 5.0.1

1. Run NPM update
    ```npm update```

    This DID update the follow-redirects as requested :
    
  ```
      "node_modules/follow-redirects": {
      "version": "1.15.6",
      "resolved": "https://registry.npmjs.org/follow-redirects/-/follow-redirects-1.15.6.tgz",
      "integrity": "sha512-wWN62YITEaOpSK584EZXJafH1AGpO8RVgElfkuXbTOrPX4fIfOyEpW/CsiNd8JdYrAoOvafRTOEnvsO++qCqFA==",
      "funding": [
        {
          "type": "individual",
          "url": "https://github.com/sponsors/RubenVerborgh"
        }
      ],
      "engines": {
        "node": ">=4.0"
      },
      "peerDependenciesMeta": {
        "debug": {
          "optional": true
        }
      }
    },

  ```  
  
2. Update [SVGO](https://www.npmjs.com/package/svgo)

  After the initial update, there were fewer vulnerabilities. 
  Next one I worked on was the css-select vulnerability 
  SVGO package was updated by editing package-lock.json 2 places. 
  This also updated css-select package.
  
3. Update [resolve-url-loader](https://www.npmjs.com/package/resolve-url-loader)

    Current Version:  5.0.0 (MIT License )
```
  resolve-url-loader  0.0.1-experiment-postcss || 3.0.0-alpha.1 - 4.0.0
  Depends on vulnerable versions of postcss
```
Updated version from 4.0.0 -> 5.0.0
Delete remaining resolved, integrity, dependencies, run npm install 
```
    "node_modules/resolve-url-loader": {
      "version": "5.0.0",           /* UPDATED FROM 4.0.0 */
      "resolved": "https://registry.npmjs.org/resolve-url-loader/-/resolve-url-loader-4.0.0.tgz",
      "integrity": "sha512-05VEMczVREcbtT7Bz+C+96eUO5HDNvdthIiMB34t7FcF8ehcu4wC0sSgPUubs3XW2Q3CNLJk/BJrCU9wVRymiA==",
      "dependencies": {
        "adjust-sourcemap-loader": "^4.0.0",
        "convert-source-map": "^1.7.0",
        "loader-utils": "^2.0.0",
        "postcss": "^8.4.31",               /* UPDATED from 7.0.35 */
        "source-map": "0.6.1"
      },
      "engines": {
        "node": ">=8.9"
      },
      "peerDependencies": {
        "rework": "1.0.1",
        "rework-visit": "1.0.0"
      },
      "peerDependenciesMeta": {
        "rework": {
          "optional": true
        },
        "rework-visit": {
          "optional": true
        }
      }
    },
```


## NPM AUDIT RESULTS 

#### npm audit report 

8 vulnerabilities (2 moderate, 6 high)

1. nth-check  <2.0.1
```   Severity: high
   Inefficient Regular Expression Complexity in nth-check - https://github.com/advisories/GHSA-rp65-9cf3-cjxr
  node_modules/svgo/node_modules/nth-check
```

  Actual version is 2.1.1 
  css-select depends on older version

2.  css-select  <=3.1.0
```  Depends on vulnerable versions of nth-check
  node_modules/svgo/node_modules/css-select
```
Updated by updating svgo, below

3.    svgo  1.0.0 - 1.3.2
```
    Depends on vulnerable versions of css-select
    node_modules/svgo
```    

  Updaated SVGO by editing package-lock.json 2-places
  replaceed "^1.2.0" with "^3.2.0"
  This also updated the css-select 

4.      @svgr/plugin-svgo  <=5.5.0
```
      Depends on vulnerable versions of svgo
      node_modules/@svgr/plugin-svgo
```
5.        @svgr/webpack  4.0.0 - 5.5.0
```
        Depends on vulnerable versions of @svgr/plugin-svgo
        node_modules/@svgr/webpack
```
6.          react-scripts  >=2.1.4
```
          Depends on vulnerable versions of @svgr/webpack
          Depends on vulnerable versions of resolve-url-loader
          node_modules/react-scripts
```
7.  postcss  <8.4.31
```Severity: moderate
    PostCSS line return parsing error - https://github.com/advisories/GHSA-7fh5-64p2-3v2j
    fix available via `npm audit fix --force`
    Will install react-scripts@3.0.1, which is a breaking change
```
8.  node_modules/resolve-url-loader/node_modules/postcss
```
  resolve-url-loader  0.0.1-experiment-postcss || 3.0.0-alpha.1 - 4.0.0
  Depends on vulnerable versions of postcss
  node_modules/resolve-url-loader
```




## Review Breaking Changes 

### Create-react-app Changelog 3-x.md


💥 **Breaking Changes (Overall)**
   Like any major release, react-scripts@3.0.0 contains a few breaking changes. We expect
   that they won't affect every user, but we recommend you look over this section to see 
   if something is relevant to you. If we missed something, please file a new issue.

1.  Jest 24
    We've updated from Jest 23 to get the latest improvements in Jest 24. We've noticed
    some differences in snapshot serialization in Jest 24, so you may need to adjust your
    tests slightly once you update. You can read more about what's changed in the
    [Jest 24 blog post](https://jestjs.io/blog/2019/01/25/jest-24-refreshing-polished-typescript-friendly).

2.  Hooks support
    We now enforce Rules of Hooks with eslint-plugin-react-hooks. If you are breaking any 
    of the rules of Hooks this will cause your build to fail.

3.  TypeScript linting
    We now lint TypeScript files. You can see the list of rules we enforce to check if
    your project is compatible. If you're using Visual Studio Code you can follow our 
    guide to setup up your editor to display lint warnings.

4.  browserslist support in @babel/preset-env
    The browserslist config in your package.json is now used to control the output of your
    JavaScript files. You can use separate configuration for development and production. 
    See here for a good starting point which gives a good development experience, 
    especially when using language features such as async/await, but still provides high
    compatibility with many browsers in production

5.  Remove --no-watch flag
    We've removed the --no-watch flag from the start script in favor of Jest's 
    own --watchAll=false.

6. New structure in asset-manifest.json
    All asset paths have been moved under the files key in asset-manifest.json.

7. 💥 **Breaking Change: create-react-app, react-dev-utils, react-scripts**
    #7988 Bump webpack-dev-server (@ianschmitz)
    NOTE: This is only a breaking change if you're using react-dev-utils outside of Create React App.

    S/B OK. 
    
8. 💥 **Breaking Change: eslint-config-react-app, react-error-overlay, react-scripts**
    #7415 Add ESLint 6 support (@mrmckeb)
    The upgrade to ESLint 6 is a breaking change only if you're using eslint-config-react-app 
    or react-error-overlay outside of Create React App.
    
    S/B OK

9. 💥 **Breaking Change: babel-preset-react-app**
        #6887 Update dependencies of Babel preset with recent changes (@skoging)



----------------------------------------------
## NPM Audit vulnerabilities (3 moderate, 6 high)

Existing Versions of React-scripts are 3.0.0
Current version is 5.0.1 (2022-04-01)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
steve@Stephens-MBP 12-use-popcorn % npm audit fix 

changed 1 package, and audited 1532 packages in 2s



==============================================

8 vulnerabilities (2 moderate, 6 high)

# Dependabot update - ReactMovieDb

* https://github.com/SteveSchilz/ReactMovieDB/security/dependabot/1

On 3/19/2024 GitHub told me I had some vulnerabilities, and that I should run 
npm audit. 

THis is the Audit 

Upgrade follow-redirects to fix 1 Dependabot alert in package-lock.json
Upgrade follow-redirects to version 1.15.6 or later. For example:

"dependencies": {
  "follow-redirects": ">=1.15.6"
}
"devDependencies": {
  "follow-redirects": ">=1.15.6"
}
To address all issues (including breaking changes), run:
  npm audit fix --force
steve@Stephens-MBP 12-use-popcorn % 
