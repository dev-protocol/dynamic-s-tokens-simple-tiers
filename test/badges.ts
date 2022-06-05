import { expect, use } from 'chai'
import { BigNumber, constants, utils } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { deploy } from './utils'
import { Badges } from '../typechain-types'
import { ethers } from 'hardhat'

use(solidity)

const getImage = async (amount: BigNumber, badges: Badges): Promise<string> =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	badges.image(
		constants.Zero,
		constants.AddressZero,
		{
			amount,
			property: constants.AddressZero,
			price: constants.Zero,
			cumulativeReward: constants.Zero,
			pendingReward: constants.Zero,
		},
		{
			entireReward: constants.Zero,
			cumulativeReward: constants.Zero,
			withdrawableReward: constants.Zero,
		}
	)

describe('Badges', () => {
	describe('image', () => {
		it('returns image string that matches the tier', async () => {
			const AMOUNT = utils.parseUnits('100')
			const badges = await deploy<Badges>('Badges')
			await badges.setTier(AMOUNT, 'XYZ')

			const image = await getImage(AMOUNT, badges)
			expect(image).to.equal('XYZ')
		})

		it('returns image string that matches the most near tier', async () => {
			const AMOUNT = utils.parseUnits('500')
			const badges = await deploy<Badges>('Badges')
			await badges.setTier(utils.parseUnits('900'), 'A')
			await badges.setTier(utils.parseUnits('100'), 'B')
			await badges.setTier(utils.parseUnits('600'), 'C')
			await badges.setTier(utils.parseUnits('400'), 'D')

			const image = await getImage(AMOUNT, badges)
			expect(image).to.equal('D')
		})
	})
	describe('setTier', () => {
		it('set a new tier', async () => {
			const AMOUNT = utils.parseUnits('100')
			const badges = await deploy<Badges>('Badges')

			expect(await getImage(AMOUNT, badges)).to.equal('')

			await badges.setTier(AMOUNT, 'XYZ')

			const image = await getImage(AMOUNT, badges)

			expect(image).to.equal('XYZ')
		})

		it('should fail to set a tier when the caller has not role', async () => {
			const AMOUNT = utils.parseUnits('100')
			const badges = await deploy<Badges>('Badges')
			const [, addr1] = await ethers.getSigners()
			const res = await badges
				.connect(addr1)
				.setTier(AMOUNT, 'A')
				.catch((err: Error) => err)
			expect(res).to.be.instanceOf(Error)
		})
	})
	describe('removeTier', () => {
		it('remove the existing tier', async () => {
			const AMOUNT = utils.parseUnits('100')
			const badges = await deploy<Badges>('Badges')
			await badges.setTier(AMOUNT, 'XYZ')

			expect(await getImage(AMOUNT, badges)).to.equal('XYZ')

			await badges.removeTier(AMOUNT)

			const image = await getImage(AMOUNT, badges)

			expect(image).to.equal('')
		})

		it('should fail to remove existing tier when the caller has not role', async () => {
			const AMOUNT = utils.parseUnits('100')
			const badges = await deploy<Badges>('Badges')
			const [, addr1] = await ethers.getSigners()
			const res = await badges
				.connect(addr1)
				.removeTier(AMOUNT)
				.catch((err: Error) => err)
			expect(res).to.be.instanceOf(Error)
		})
	})
})
