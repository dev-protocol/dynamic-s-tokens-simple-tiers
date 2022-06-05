import { expect, use } from 'chai'
import { BigNumber, constants, utils } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { deploy } from './utils'
import { SimpleTiers } from '../typechain-types'
import { ethers } from 'hardhat'

use(solidity)

const getImage = async (
	amount: BigNumber,
	contract: SimpleTiers
): Promise<string> =>
	contract.image(
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

describe('SimpleTiers', () => {
	describe('image', () => {
		it('returns image string that matches the tier', async () => {
			const AMOUNT = utils.parseUnits('100')
			const contract = await deploy<SimpleTiers>('SimpleTiers')
			await contract.setTier(AMOUNT, 'XYZ')

			const image = await getImage(AMOUNT, contract)
			expect(image).to.equal('XYZ')
		})

		it('returns image string that matches the most near tier', async () => {
			const AMOUNT = utils.parseUnits('500')
			const contract = await deploy<SimpleTiers>('SimpleTiers')
			await contract.setTier(utils.parseUnits('900'), 'A')
			await contract.setTier(utils.parseUnits('100'), 'B')
			await contract.setTier(utils.parseUnits('600'), 'C')
			await contract.setTier(utils.parseUnits('400'), 'D')

			const image = await getImage(AMOUNT, contract)
			expect(image).to.equal('D')
		})
	})
	describe('setTier', () => {
		it('set a new tier', async () => {
			const AMOUNT = utils.parseUnits('100')
			const contract = await deploy<SimpleTiers>('SimpleTiers')

			expect(await getImage(AMOUNT, contract)).to.equal('')

			await contract.setTier(AMOUNT, 'XYZ')

			const image = await getImage(AMOUNT, contract)

			expect(image).to.equal('XYZ')
		})

		it('replace the existing tier when the passed tier is existing value', async () => {
			const AMOUNT = utils.parseUnits('100')
			const contract = await deploy<SimpleTiers>('SimpleTiers')
			await contract.setTier(AMOUNT, 'ABC')

			expect(await getImage(AMOUNT, contract)).to.equal('ABC')

			await contract.setTier(AMOUNT, 'XYZ')

			const image = await getImage(AMOUNT, contract)

			expect(image).to.equal('XYZ')
		})

		it('should fail to set a tier when the caller has not role', async () => {
			const AMOUNT = utils.parseUnits('100')
			const contract = await deploy<SimpleTiers>('SimpleTiers')
			const [, addr1] = await ethers.getSigners()
			const res = await contract
				.connect(addr1)
				.setTier(AMOUNT, 'A')
				.catch((err: Error) => err)
			expect(res).to.be.instanceOf(Error)
		})
	})
	describe('removeTier', () => {
		it('remove the existing tier', async () => {
			const AMOUNT = utils.parseUnits('100')
			const contract = await deploy<SimpleTiers>('SimpleTiers')
			await contract.setTier(AMOUNT, 'XYZ')

			expect(await getImage(AMOUNT, contract)).to.equal('XYZ')

			await contract.removeTier(AMOUNT)

			const image = await getImage(AMOUNT, contract)

			expect(image).to.equal('')
		})

		it('should fail to remove existing tier when the caller has not role', async () => {
			const AMOUNT = utils.parseUnits('100')
			const contract = await deploy<SimpleTiers>('SimpleTiers')
			const [, addr1] = await ethers.getSigners()
			const res = await contract
				.connect(addr1)
				.removeTier(AMOUNT)
				.catch((err: Error) => err)
			expect(res).to.be.instanceOf(Error)
		})
	})
})
