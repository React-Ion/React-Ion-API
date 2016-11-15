const ejs = require('ejs');
const fs = require('fs.extra');
const helper = require('./generateHelper');
const filePath = require('./filePaths');
const componentHelper = require('./componentHelper');
const utils = require('./utility');

const structureSetup = (tree, user, callback) => {
  helper.webpackSetup(tree, user, () => {
    helper.serverSetup(tree, user, () => {
      if (tree.router === 1) {
        helper.routerSetup(tree, user, () => {
          callback();
        });
      } else {
        helper.htmlSetup(tree, user, () => {
          callback();
        });
      }
    });
  });
};

module.exports = (tree, userId, cb) => {
  const componentTotal = tree.total;
  let counter = 0;

  // Paths
  const componentPath = filePath.getComponentPath(userId);
  const mainJsPath = filePath.getMainJsPath(userId);
  const userPath = filePath.getUserPath(userId);
  const structurePath = filePath.STRUCTURE_TEMPLATE_PATH;

  const generateFile = (treeData, inital) => {
    utils.consoleLog(`Generate Files for: ${treeData.name}`);
    const tempTreeData = treeData;
    if (inital && tree.router === 0) {
      tempTreeData.initial = true;
    } else {
      tempTreeData.initial = false;
    }

    // tempTreeData.convertedProps = helper.addProps(tempTreeData);
    // tempTreeData.convertedCss = helper.createCss(tempTreeData);
    helper.cssSetup(helper.combineCss(tempTreeData), userId, () => {
      ejs.renderFile(componentHelper.getComponent(tempTreeData), tempTreeData, (err, html) => {
        const jsPath = inital ? mainJsPath : componentPath;

        fs.writeFile(`${jsPath}/${tempTreeData.name}.jsx`, html, (err2) => {
          if (err2) {
            console.error(err2);
          }
          counter += 1;
          if (tempTreeData.children.length !== 0) {
            tempTreeData.children.forEach((component) => {
              if (component.componentType !== 'Text') {
                generateFile(component);
              } else {
                counter += 1;
              }
            });
          } else if (counter === componentTotal) {
            cb();
          }
        });
      });
    });
  };
  utils.consoleLog('Ready to remove');
  fs.rmrf(userPath, (err) => {
    if (err) {
      console.error(err);
    }
    utils.consoleLog('Finish removing');
    fs.copyRecursive(structurePath, userPath, (err2) => {
      if (err2) {
        throw err2;
      }
      utils.consoleLog("Copied 'structure' to 'user'");
      structureSetup(tree, userId, () => {
        utils.consoleLog('Finish building structure');
        for (let i = 0; i < tree.routes.length; i += 1) {
          generateFile(tree.routes[i], true);
        }
      });
    });
  });
};
