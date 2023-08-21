// ファイル選択ボタン押下時の処理
const visibleButton = document.getElementById("visibleButton");
const invisibleButton = document.getElementById("invisibleButton");
visibleButton.addEventListener("click", (e) => {
  if (invisibleButton) {
    invisibleButton.click();
  }
}, false);


// 画像選択後の処理
let key = 0;
function previewImage(obj) {
  // 選択された画像の表示
  // 選択ファイル数分だけ処理を回す
  for(i = 0; i < obj.files.length; i++) {
    var fileReader = new FileReader();
    fileReader.onload = (function(e) {
        // 表示する際に必要な要素の作成
        var previewDiv = document.getElementById("preview");
        var figure = document.createElement("figure");
        var rmBtn = document.createElement("button");
        var img = new Image();
        // 読み込んだ結果をimgタグのsrc属性にセット
        img.src = e.target.result;
        img.className = "previewImg";
        // 削除ボタン関係
        rmBtn.name = key;
        rmBtn.textContent = "削除";
        rmBtn.className = "removeButton";
        rmBtn.onclick = (function () {
            var element = document.getElementById("img-" + String(rmBtn.name)).remove();
        });
        // 要素をページに追加する
        figure.setAttribute("id", "img-" + key);
        figure.appendChild(rmBtn);
        var brtag2 = document.createElement("br");
        figure.appendChild(brtag2);
        figure.appendChild(img);
        previewDiv.appendChild(figure);
        key++;
    });
    fileReader.readAsDataURL(obj.files[i]);
  }
  // プレビュー文字の表示切替
  var previewTextDiv = document.getElementById("previewTextDiv");
  changeVisible(previewTextDiv);
  // 実行ボタンの表示切替
  var runBtnDiv = document.getElementById("runBtnDiv");
  changeVisible(runBtnDiv);
}


// クリップボードからペースト時の処理
document.body.addEventListener('keydown',
async event => {
  // Ctrl + V が押された時
  if (event.key === 'v' && event.ctrlKey) {
    // クリップボードの中身を取得
    var pasteEvents = await navigator.clipboard.read();
    for (var item of pasteEvents) {
      // 画像が含まれていない場合は例外をスロー
      if (!item.types.includes('image/png')) {
        alert("画像ファイルをペーストしてください");
        throw new Error('Clipboard contains non-image data.');
      }
      // 画像ファイルだった場合
      // クリップボードの中身をblobに変換
      var blob = await item.getType('image/png');

      // 画像選択時と同様に必要な要素を作成していく
      var previewDiv = document.getElementById("preview");
      var figure = document.createElement("figure");
      var rmBtn = document.createElement("button");
      var img = new Image();
      // blobからURLに変換し、imgタグのsrc属性にセット
      img.src = URL.createObjectURL(blob);
      img.className = "previewImg";
      // blobへの参照を削除してメモリの解放を行う(出来ているかは不明)
      URL.revokeObjectURL(blob);
      // 削除ボタン関係
      rmBtn.name = key;
      rmBtn.textContent = "削除";
      rmBtn.className = "removeButton";
      rmBtn.onclick = (function () {
          var element = document.getElementById("img-" + String(rmBtn.name)).remove();
      });
      // 要素をページに追加する
      figure.setAttribute("id", "img-" + key);
      figure.appendChild(rmBtn);
      var brtag2 = document.createElement("br");
      figure.appendChild(brtag2);
      figure.appendChild(img);
      previewDiv.appendChild(figure);
      key++;

      // プレビュー文字の表示切替
      var previewTextDiv = document.getElementById("previewTextDiv");
      changeVisible(previewTextDiv);
      // 実行ボタンの表示切替
      var runBtnDiv = document.getElementById("runBtnDiv");
      changeVisible(runBtnDiv);
    }
  }
});


// 画像を取得して新しい画像を生成する

// 下側に結合
function GenerateNewImgVertical() {
  // 生成されたimgタグに共通するクラス名で要素を全取得
  var getImagesElement = document.getElementsByClassName("previewImg");
  // 処理内でのみ使うcanvasの作成
  var newImgcv = document.createElement("canvas");
  var ct = newImgcv.getContext("2d");
  var cvWidth = 0;
  var cvHeight = 0;
  // 生成後canvasの横と縦の大きさを求める
  for (i = 0; i < getImagesElement.length; i++) {
    // 縦幅は要素の和
    cvHeight += getImagesElement[i].naturalHeight;
    if (cvWidth < getImagesElement[i].naturalWidth) {
      // 横幅は要素の最大値
      cvWidth = getImagesElement[i].naturalWidth;
    }
  }
  // canvasのサイズを設定
  newImgcv.width = cvWidth;
  newImgcv.height = cvHeight;
  ct.fillStyle = "rgba(0,0,0,0)";
  ct.fillRect(0,0,newImgcv.width,newImgcv.height);

  // 要素数分描画を行う
  for (i = 0; i < getImagesElement.length; i++) {
    //描画を行う位置
    var drawPointX = 0;
    var drawPointY = 0;
    if (i == 0) {
      // 1枚目は何も行わない
    } else {
      // 2枚目以降はそれまでの画像の幅だけ下にずらして描画する
      for (j = 0; j < i; j++) {
        drawPointY += getImagesElement[j].naturalHeight;
      }
    }
    // 描画
    ct.drawImage(getImagesElement[i],drawPointX,drawPointY);
  }
  // canvasの中身をimgに渡す
  var resultCv = newImgcv.toDataURL("image/png");
  document.getElementById("resultImg").src = resultCv;
  // 結果表示divの表示切替
  var resultDiv = document.getElementById("resultDiv");
  changeVisible(resultDiv);
}

// 右側に結合
function GenerateNewImgHorizontal() {
  // 生成されたimgタグに共通するクラス名で要素を全取得
  var getImagesElement = document.getElementsByClassName("previewImg");
  // 処理内でのみ使うcanvasの作成
  var newImgcv = document.createElement("canvas");
  var ct = newImgcv.getContext("2d");
  var cvWidth = 0;
  var cvHeight = 0;
  // 生成後canvasの横と縦の大きさを求める
  for (i = 0; i < getImagesElement.length; i++) {
    // 横幅は要素の和
    cvWidth += getImagesElement[i].naturalWidth;
    if (cvHeight < getImagesElement[i].naturalHeight) {
      // 縦幅は要素の最大値
      cvHeight = getImagesElement[i].naturalHeight;
    }
  }
  // canvasのサイズを設定
  newImgcv.width = cvWidth;
  newImgcv.height = cvHeight;
  ct.fillStyle = "rgba(0,0,0,0)";
  ct.fillRect(0,0,newImgcv.width,newImgcv.height);

  // 要素数分描画を行う
  for (i = 0; i < getImagesElement.length; i++) {
    //描画を行う位置
    var drawPointX = 0;
    var drawPointY = 0;
    if (i == 0) {
      // 何も行わない
    } else {
      // 2枚目以降はそれまでの画像の幅だけ右にずらして描画する
      for (j = 0; j < i; j++) {
        drawPointX += getImagesElement[j].naturalWidth;
      }
    }
    // 描画
    ct.drawImage(getImagesElement[i],drawPointX,drawPointY);
  }
  // canvasの中身をimgに渡す
  var resultCv = newImgcv.toDataURL("image/png");
  document.getElementById("resultImg").src = resultCv;
  // 結果表示divの表示切替
  var resultDiv = document.getElementById("resultDiv");
  changeVisible(resultDiv);
}


// 表示切替
function changeVisible(obj) {
  if (obj.hidden == true) {
    obj.hidden = false;
  }
}
