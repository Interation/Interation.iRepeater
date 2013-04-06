using System.Collections.Generic;
using Interation.iRepeater.Repository.Entity;
using Interation.iRepeater.Repository.IRepositoryProvider;
using Interation.iRepeater.Service.Contract;
using Interation.iRepeater.Service.IServiceProvider;

namespace Interation.iRepeater.Service.ServiceImplementation
{
    public class TopicService : ITopicService
    {
        ITopicRepository _topicRepository;

        public TopicService(ITopicRepository topicRepository)
        {
            _topicRepository = topicRepository;
        }

        public List<TopicContract> GetAdvised()
        {
            var topics = _topicRepository.GetCurrentTopics();

            if (topics == null) { return null; }

            return topics.ConvertAll(refer => refer.ToContractModel());
        }
    }
}
