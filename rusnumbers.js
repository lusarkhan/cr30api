'use strict';

exports.default = function (lsnum) {

    this._lsnum = lsnum;
    this.ls_text = this._lsnum.replace('три единицы', '111');
    this.ls_text = this._lsnum.replace('три единицы', '111');
    this.ls_text = this._lsnum.replace('три единиц', '111');
    this.ls_text = this._lsnum.replace('три единица', '111');
    this.ls_text = this._lsnum.replace('три единиц', '111');
    this.ls_text = this._lsnum.replace('three units ', '111');
    this.ls_text = this._lsnum.replace('3units', '111');

    return this.ls_text;

}
