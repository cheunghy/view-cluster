import selectIt from '../../obsolete/utils/selectIt';

import assert from 'assert';

suite('utils', function(){

  suite('selectIt', function() {

    test('select by string in object', function() {
      assert.equal(selectIt({
        tabs: {
          house: 'i am not',
          home: 'here i am!'
        }
      }, ['tabs', 'home']), 'here i am!');
    });

    test('select by number in array', function() {
      assert.equal(selectIt([
        [
          [
            'I am not!'
          ]
        ],
        [
          [
            'I am still not'
          ],
          [
            'here i am!'
          ]
        ],
        [
          'nothing here!'
        ]
      ], ['1', '1']), 'here i am!');
    });

    test('select by string in array, give the object with the string as key', function() {
      assert.equal(selectIt([
        {
          key: 'keyFirst'
        },
        {
          key: 'keySecond'
        }
      ], ['keyFirst', 'key']), 'keyFirst');
    });

    test('shouldn\'t bug if key is array\'s method', function() {
      assert.deepEqual(selectIt([{key: 'some'}, {key: 'reduce'}, {key: 'map'}], 'map'), {key: 'map'});
    });

  });

});