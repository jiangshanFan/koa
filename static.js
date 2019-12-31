// ����̬�ļ��� static ������ļ�
const path = require('path');
// ��ȡ�ļ��ĸ�ʽ
const mime = require('mime');
//mz�ṩ��API��Node.js��fsģ����ȫ��ͬ����fsģ��ʹ�ûص�����mz��װ��fs��Ӧ�ĺ���������ΪPromise�����������ǾͿ��Էǳ��򵥵���await����mz�ĺ�����������Ҫ�κλص���
const fs = require('mz/fs');

// URL: ���� '/static/'
// dir: ���� _dirname + '/static'
function staticFiles(url, dir) {
  return async (ctx, next) => {
    let rpath = ctx.request.path;
    // �ж��Ƿ���ָ����URL��ͷ
    if (rpath.startsWith(url)) {
      // ��ȡ�ļ�����·��
      // path.join() ����ʹ��ƽ̨�ض��ķָ�����ȫ�������� path Ƭ�����ӵ�һ�𣬲��淶�����ɵ�·�����ᰴ��cdģʽ��ִ�����ɵ�·����Windows��Ĭ����'\'
        let fp = path.join(dir, rpath.substring(url.length));
        console.log(fp);
      // �ж��ļ��Ƿ����
      if (await fs.exists(fp)) {
        // �����ļ���mime
          ctx.response.type = mime.getType(rpath);
        // ��ȡ�ļ����ݲ���ֵ��response.body
        ctx.response.body = await fs.readFile(fp);
      } else {
        // �ļ�������
        ctx.response.status = 404;
      }
    } else {
      // ����ָ��ǰ׺��URL������������һ��middleware
      await next();
    }
  };
}

module.exports = staticFiles;