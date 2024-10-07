import { StellarMessageHandler } from '../stellar-message-handler';
import { ScpEnvelopeHandler } from '../scp-envelope/scp-envelope-handler';
import { QuorumSetManager } from '../../../quorum-set-manager';
import { P } from 'pino';
import { Keypair } from '@stellar/stellar-base';
import { mock, MockProxy } from 'jest-mock-extended';
import { createDummyExternalizeMessage } from '../../../../__fixtures__/createDummyExternalizeMessage';
import { ok } from 'neverthrow';
import { createDummyPeersMessage } from '../../../../__fixtures__/createDummyPeersMessage';
import { createDummyQuorumSetMessage } from '../../../../__fixtures__/createDummyQuorumSetMessage';
import { createDummyDontHaveMessage } from '../../../../__fixtures__/createDummyDontHaveMessage';
import { createDummyErrLoadMessage } from '../../../../__fixtures__/createDummyErrLoadMessage';
import { PeerNodeCollection } from '../../../../peer-node-collection';
import { Observation } from '../../../observation';

describe('StellarMessageHandler', () => {
	let scpManager: MockProxy<ScpEnvelopeHandler>;
	let quorumSetManager: MockProxy<QuorumSetManager>;
	let logger: MockProxy<P.Logger>;
	let handler: StellarMessageHandler;
	let senderPublicKey: string;

	beforeEach(() => {
		scpManager = mock<ScpEnvelopeHandler>();
		quorumSetManager = mock<QuorumSetManager>();
		logger = mock<P.Logger>();
		handler = new StellarMessageHandler(scpManager, quorumSetManager, logger);
		senderPublicKey = 'A';
	});

	describe('handleStellarMessage', () => {
		it('should handle SCP message and attempt ledger close', () => {
			const keyPair = Keypair.random();
			const stellarMessage = createDummyExternalizeMessage(keyPair);
			const observation = mock<Observation>();
			const closedLedger = {
				sequence: BigInt(2),
				closeTime: new Date(),
				value: '',
				localCloseTime: new Date()
			};
			scpManager.handle.mockReturnValueOnce(
				ok({
					closedLedger: closedLedger
				})
			);
			const result = handler.handleStellarMessage(
				senderPublicKey,
				stellarMessage,
				true,
				observation
			);
			expect(scpManager.handle).toHaveBeenCalledTimes(1);
			expect(result.isOk()).toBeTruthy();
			if (!result.isOk()) return;
			expect(result.value).toEqual({
				closedLedger: closedLedger,
				peers: []
			});
		});

		it('should not attempt ledger close', () => {
			const stellarMessage = createDummyExternalizeMessage();
			const observation = mock<Observation>();
			const result = handler.handleStellarMessage(
				senderPublicKey,
				stellarMessage,
				false,
				observation
			);
			expect(scpManager.handle).toHaveBeenCalledTimes(0);
			expect(result.isOk()).toBeTruthy();
		});

		it('should handle peers message', () => {
			const stellarMessage = createDummyPeersMessage();
			const observation = mock<Observation>();
			const peerNodes = new PeerNodeCollection();
			peerNodes.getOrAdd(senderPublicKey);
			observation.peerNodes = peerNodes;

			const result = handler.handleStellarMessage(
				senderPublicKey,
				stellarMessage,
				true,
				observation
			);
			expect(result.isOk()).toBeTruthy();
			if (!result.isOk()) return;
			expect(result.value).toEqual({
				closedLedger: null,
				peers: [['127.0.0.1', 11625]]
			});
			expect(peerNodes.get(senderPublicKey)?.suppliedPeerList).toBeTruthy();
		});

		it('should handle SCP quorum set message', () => {
			const stellarMessage = createDummyQuorumSetMessage();
			const observation = mock<Observation>();
			const result = handler.handleStellarMessage(
				senderPublicKey,
				stellarMessage,
				true,
				observation
			);
			expect(quorumSetManager.processQuorumSet).toHaveBeenCalledTimes(1);
			expect(result.isOk()).toBeTruthy();
			if (!result.isOk()) return;
			expect(result.value).toEqual({
				closedLedger: null,
				peers: []
			});
		});

		it('should handle dont have message', () => {
			const stellarMessage = createDummyDontHaveMessage();
			const observation = mock<Observation>();
			const result = handler.handleStellarMessage(
				senderPublicKey,
				stellarMessage,
				true,
				observation
			);
			expect(
				quorumSetManager.peerNodeDoesNotHaveQuorumSet
			).toHaveBeenCalledTimes(1);
			expect(result.isOk()).toBeTruthy();
			if (!result.isOk()) return;
			expect(result.value).toEqual({
				closedLedger: null,
				peers: []
			});
		});

		it('should handle errLoad message', () => {
			const stellarMessage = createDummyErrLoadMessage();
			const observation = mock<Observation>();
			const peerNodes = new PeerNodeCollection();
			peerNodes.getOrAdd(senderPublicKey);
			observation.peerNodes = peerNodes;
			const result = handler.handleStellarMessage(
				senderPublicKey,
				stellarMessage,
				true,
				observation
			);
			expect(result.isOk()).toBeTruthy();
			expect(
				observation.peerNodes.get(senderPublicKey)?.overLoaded
			).toBeTruthy();
			if (!result.isOk()) return;
			expect(result.value).toEqual({
				closedLedger: null,
				peers: []
			});
		});
	});
});
