'use strict';

var PubSub = global.PubSub || require('../src/pubsub'),
    referee = require('referee'),
    assert = referee.assert,
    refute = referee.refute,
    sinon = require('sinon');

sinon.assert.fail = referee.fail;

describe('Listening to (un)subscriptions', function() {
    beforeEach(function(){
        this.clock = sinon.useFakeTimers();
    });

    afterEach(function(){
        this.clock.restore();
    });

    describe('subscribe method', function() {
        beforeEach(function() {
            this.spy1 = sinon.spy();
            this.spy2 = sinon.spy();
            this.spy3 = sinon.spy();
            this.spy4 = sinon.spy();
            this.spy5 = sinon.spy();
            this.spy6 = sinon.spy();
            this.spy7 = sinon.spy();
            this.spy8 = sinon.spy();
            this.spy9 = sinon.spy();
            this.spy10 = sinon.spy();
            this.spy11 = sinon.spy();

            PubSub.subscribe('@sub', this.spy1);
            PubSub.subscribe('@sub.topic', this.spy2);
            PubSub.subscribe('@sub.topic.subtopic', this.spy3);
            PubSub.subscribe('@sub.other', this.spy4);
            PubSub.subscribe('@sub.other.othersub', this.spy5);
            PubSub.subscribe('@firstsub.topic.subtopic', this.spy6);
            PubSub.subscribe('@firstsub.other.othersub', this.spy7);

            this.clock.tick(1);

            this.token1 = PubSub.subscribe('topic', this.spy8);
            this.token2 = PubSub.subscribe('topic.subtopic', this.spy9);
            this.token3 = PubSub.subscribe('topic.subtopic', this.spy10);
            this.token4 = PubSub.subscribe('other.othersub', this.spy11);

            this.clock.tick(1);
        });

        afterEach(function() {
            PubSub.clearAllSubscriptions();
        });

        it('should trigger correct number of calls to @sub subscribers', function(done) {
            sinon.assert.callCount(this.spy1, 4);
            sinon.assert.callCount(this.spy2, 3);
            sinon.assert.callCount(this.spy3, 2);
            sinon.assert.callCount(this.spy4, 1);
            sinon.assert.callCount(this.spy5, 1);
            sinon.assert.callCount(this.spy8, 0);
            sinon.assert.callCount(this.spy9, 0);
            sinon.assert.callCount(this.spy10, 0);
            sinon.assert.callCount(this.spy11, 0);

            done();
        });

        it('should call @sub subscribers with correct data', function(done) {
            sinon.assert.calledWithExactly(this.spy1, '@sub.topic', {token: this.token1, func: this.spy8});
            sinon.assert.calledWithExactly(this.spy1, '@sub.topic.subtopic', {token: this.token2, func: this.spy9});
            sinon.assert.calledWithExactly(this.spy1, '@sub.other.othersub', {token: this.token4, func: this.spy11});
            sinon.assert.calledWithExactly(this.spy2, '@sub.topic', {token: this.token1, func: this.spy8});
            sinon.assert.calledWithExactly(this.spy2, '@sub.topic.subtopic', {token: this.token2, func: this.spy9});
            sinon.assert.calledWithExactly(this.spy2, '@sub.topic.subtopic', {token: this.token3, func: this.spy10});
            sinon.assert.calledWithExactly(this.spy3, '@sub.topic.subtopic', {token: this.token2, func: this.spy9});
            sinon.assert.calledWithExactly(this.spy3, '@sub.topic.subtopic', {token: this.token3, func: this.spy10});
            sinon.assert.calledWithExactly(this.spy4, '@sub.other.othersub', {token: this.token4, func: this.spy11});
            sinon.assert.calledWithExactly(this.spy5, '@sub.other.othersub', {token: this.token4, func: this.spy11});

            done();
        });

        it('should call @firstsub subscribers on first subscribe to a topic', function(done) {
            assert.equals(this.spy6.callCount, 1);
            assert.equals(this.spy7.callCount, 1);
            assert(this.spy6.calledBefore(this.spy3));
            assert(this.spy7.calledBefore(this.spy5));

            PubSub.unsubscribe('topic.subtopic');
            this.clock.tick(1);
            PubSub.subscribe('topic.subtopic', sinon.spy());
            PubSub.subscribe('topic.subtopic', sinon.spy());
            this.clock.tick(1);

            sinon.assert.callCount(this.spy6, 2);

            done();
        });

        it('should call @firstsub after unsubscribing all from topic by token and re-subscribing', function(done) {
            PubSub.unsubscribe('other.othersub');
            this.clock.tick(1);

            var localToken1 = PubSub.subscribe('other.othersub', sinon.stub());
            var localToken2 = PubSub.subscribe('other.othersub', sinon.stub());
            this.clock.tick(1);

            sinon.assert.callCount(this.spy7, 2);

            PubSub.unsubscribe(localToken1);
            PubSub.unsubscribe(localToken2);
            this.clock.tick(1);

            PubSub.subscribe('other.othersub', sinon.stub());
            this.clock.tick(1);

            sinon.assert.callCount(this.spy7, 3);

            PubSub.unsubscribe('other.othersub');
            this.clock.tick(1);

            done();
        });

        it('should call @firstsub after unsubscribing all from topic by function and re-subscribing', function(done) {
            PubSub.unsubscribe('other.othersub');
            this.clock.tick(1);

            var stub1 = sinon.stub();
            var stub2 = sinon.stub();
            PubSub.subscribe('other.othersub', stub1);
            PubSub.subscribe('other.othersub', stub2);
            this.clock.tick(1);

            sinon.assert.callCount(this.spy7, 2);

            PubSub.unsubscribe(stub1);
            PubSub.unsubscribe(stub2);
            this.clock.tick(1);

            PubSub.subscribe('other.othersub', sinon.stub());
            this.clock.tick(1);

            sinon.assert.callCount(this.spy7, 3);
            done();
        });
    });

    describe('unsubscribe method', function() {
        beforeEach(function() {
            this.spy1 = sinon.spy();
            this.spy2 = sinon.spy();
            this.spy3 = sinon.spy();
            this.spy4 = sinon.spy();
            this.spy5 = sinon.spy();
            this.spy6 = sinon.spy();
            this.spy7 = sinon.spy();
            this.spy8 = sinon.spy();
            this.preLastUnsubSpy = sinon.spy();
            this.stub1 = sinon.stub();
            this.stub2 = sinon.stub();
            this.stub3 = sinon.stub();
            this.stub4 = sinon.stub();
            this.stub5 = sinon.stub();
            this.stub6 = sinon.stub();
            this.stub7 = sinon.stub();

            PubSub.subscribe('@unsub', this.spy1);
            PubSub.subscribe('@unsub.topic', this.spy2);
            PubSub.subscribe('@unsub.topic.subtopic', this.spy3);
            PubSub.subscribe('@unsub.other', this.spy4);
            PubSub.subscribe('@unsub.other.othersub', this.spy5);
            PubSub.subscribe('@lastunsub', this.spy6);
            PubSub.subscribe('@lastunsub.topic.subtopic', this.spy7);
            PubSub.subscribe('@lastunsub.other.othersub', this.spy8);

            this.clock.tick(1);

            PubSub.subscribe('topic', this.stub1);
            PubSub.subscribe('topic.subtopic', this.stub2);
            this.token1 = PubSub.subscribe('topic', this.stub3);
            this.token2 = PubSub.subscribe('topic.subtopic', this.stub4);
            this.token3 = PubSub.subscribe('topic', this.stub5);
            this.token4 = PubSub.subscribe('topic.subtopic', this.stub6);
            this.token5 = PubSub.subscribe('other.othersub', this.stub7);

            this.clock.tick(1);

            PubSub.unsubscribe(this.token2);
            PubSub.unsubscribe(this.token1);
            PubSub.unsubscribe(this.stub6);
            PubSub.unsubscribe(this.stub5);
            this.preLastUnsubSpy();
            PubSub.unsubscribe('topic.subtopic');
            PubSub.unsubscribe('topic');
            PubSub.unsubscribe(this.token5);

            this.clock.tick(1);
        });

        afterEach(function() {
            PubSub.clearAllSubscriptions();
        });

        it('should trigger correct number of calls to @unsub subscribers', function(done) {
            sinon.assert.callCount(this.spy1, 7);
            sinon.assert.callCount(this.spy2, 6);
            sinon.assert.callCount(this.spy3, 3);
            sinon.assert.callCount(this.spy4, 1);
            sinon.assert.callCount(this.spy5, 1);

            done();
        });

        it('should call @unsub subscribers with empty data on topic unsubscribe', function(done) {
            sinon.assert.calledWithExactly(this.spy1, '@unsub.topic.subtopic', {});
            sinon.assert.calledWithExactly(this.spy2, '@unsub.topic.subtopic', {});
            sinon.assert.calledWithExactly(this.spy3, '@unsub.topic.subtopic', {});
            sinon.assert.calledWithExactly(this.spy1, '@unsub.topic', {});
            sinon.assert.calledWithExactly(this.spy2, '@unsub.topic', {});

            done();
        });

        it('should call @unsub subscribers with correct data on token/function unsubscribe', function(done) {
            sinon.assert.calledWithExactly(this.spy1, '@unsub.topic', {token: this.token1, func: this.stub3});
            sinon.assert.calledWithExactly(this.spy1, '@unsub.topic.subtopic', {token: this.token2, func: this.stub4});
            sinon.assert.calledWithExactly(this.spy1, '@unsub.topic', {token: this.token3, func: this.stub5});
            sinon.assert.calledWithExactly(this.spy1, '@unsub.topic.subtopic', {token: this.token4, func: this.stub6});
            sinon.assert.calledWithExactly(this.spy1, '@unsub.other.othersub', {token: this.token5, func: this.stub7});
            sinon.assert.calledWithExactly(this.spy2, '@unsub.topic.subtopic', {token: this.token2, func: this.stub4});
            sinon.assert.calledWithExactly(this.spy2, '@unsub.topic.subtopic', {token: this.token4, func: this.stub6});
            sinon.assert.calledWithExactly(this.spy3, '@unsub.topic.subtopic', {token: this.token2, func: this.stub4});
            sinon.assert.calledWithExactly(this.spy3, '@unsub.topic.subtopic', {token: this.token4, func: this.stub6});
            sinon.assert.calledWithExactly(this.spy4, '@unsub.other.othersub', {token: this.token5, func: this.stub7});
            sinon.assert.calledWithExactly(this.spy5, '@unsub.other.othersub', {token: this.token5, func: this.stub7});

            done();
        });

        it('should call @lastunsub subscribers on last unsubscribe from a topic', function(done) {
            assert.equals(this.spy7.callCount, 1);
            assert(this.spy7.calledAfter(this.preLastUnsubSpy));
            assert.equals(this.spy8.callCount, 1);

            var localToken1 = PubSub.subscribe('topic.subtopic', sinon.stub());
            var localToken2 = PubSub.subscribe('topic.subtopic', sinon.stub());
            this.clock.tick(1);
            PubSub.unsubscribe(localToken1);
            PubSub.unsubscribe(localToken2);
            this.clock.tick(1);

            assert.equals(this.spy7.callCount, 2);

            done();
        });

        it('should allow unsubscribing from @unsub and @lastunsub topics', function(done) {
            // publish should return true, because at this point there
            // should be listeners to these topics
            assert(PubSub.publish('@unsub', {}));
            assert(PubSub.publish('@lastunsub', {}));

            this.clock.tick(1);

            PubSub.unsubscribe('@unsub');
            PubSub.unsubscribe('@lastunsub');

            this.clock.tick(1);

            // now, publish should return false
            refute(PubSub.publish('@unsub', {}));
            refute(PubSub.publish('@lastunsub', {}));

            done();
        });
    });

    it('clearAllSubscriptions method should call @unsuball listeners', function(done) {
        var unsuballSpy = sinon.spy();

        PubSub.subscribe('@unsuball', unsuballSpy);
        PubSub.subscribe('@unsuball', unsuballSpy);
        this.clock.tick(1);
        PubSub.clearAllSubscriptions();
        this.clock.tick(1);

        assert(unsuballSpy.calledTwice);

        done();
    });
});
